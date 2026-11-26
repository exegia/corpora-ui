//! Local, embedded playback examples. Native decoding belongs to the gallery;
//! Attachment remains a controlled, presentational component.

use std::{sync::Arc, time::Duration};

use corpora_ui::atoms::{Button, Sizable as _};
use corpora_ui::composed::{Attachment, AttachmentKind};
use gpui_kit::component::{ActiveTheme as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::*;

#[cfg(target_os = "macos")]
#[path = "media/native.rs"]
mod native;

#[derive(Clone, Copy)]
pub enum Sample {
    Video,
    Audio,
}

pub struct MediaExample {
    sample: Sample,
    playing: bool,
    position: f64,
    duration: f64,
    frame: ImageSource,
    error: Option<String>,
    task: Option<Task<()>>,
    waveform: Vec<f32>,
    #[cfg(target_os = "macos")]
    backend: Option<native::Player>,
}

impl MediaExample {
    pub fn new(sample: Sample, cx: &mut Context<Self>) -> Self {
        cx.on_release(|this, cx| {
            if let ImageSource::Render(frame) = &this.frame {
                cx.drop_image(frame.clone(), None);
            }
        })
        .detach();
        Self {
            sample,
            playing: false,
            position: 0.,
            duration: 8.,
            frame: Arc::new(Image::from_bytes(
                ImageFormat::Png,
                include_bytes!("media/fractal-poster.png").to_vec(),
            ))
            .into(),
            error: None,
            task: None,
            waveform: waveform(),
            #[cfg(target_os = "macos")]
            backend: None,
        }
    }

    pub fn pause(&mut self, cx: &mut Context<Self>) {
        #[cfg(target_os = "macos")]
        if let Some(backend) = &self.backend {
            backend.pause();
        }
        self.playing = false;
        self.task = None;
        cx.notify();
    }

    fn toggle(&mut self, cx: &mut Context<Self>) {
        if self.playing {
            self.pause(cx);
            return;
        }
        self.play(cx);
    }

    fn play(&mut self, cx: &mut Context<Self>) {
        #[cfg(not(target_os = "macos"))]
        {
            self.error = Some("Embedded sample playback currently requires macOS.".into());
            cx.notify();
        }
        #[cfg(target_os = "macos")]
        {
            if self.backend.is_none() {
                match native::Player::new(self.sample) {
                    Ok(backend) => self.backend = Some(backend),
                    Err(error) => {
                        self.error = Some(error);
                        cx.notify();
                        return;
                    }
                }
            }
            let backend = self.backend.as_ref().unwrap();
            if self.position >= self.duration - 0.05 {
                backend.rewind();
                self.position = 0.;
            }
            backend.play();
            self.error = None;
            self.playing = true;
            self.task = Some(cx.spawn(async move |this, cx| {
                loop {
                    cx.background_executor()
                        .timer(Duration::from_millis(33))
                        .await;
                    if !this.update(cx, |this, cx| this.tick(cx)).unwrap_or(false) {
                        break;
                    }
                }
            }));
            cx.notify();
        }
    }

    #[cfg(target_os = "macos")]
    fn tick(&mut self, cx: &mut Context<Self>) -> bool {
        let Some(backend) = &self.backend else {
            return false;
        };
        match backend.poll() {
            Ok(state) => {
                self.position = state.position;
                self.duration = state.duration;
                if let Some(frame) = state.frame {
                    let previous = std::mem::replace(&mut self.frame, frame.into());
                    if let ImageSource::Render(previous) = previous {
                        cx.drop_image(previous, None);
                    }
                }
                if state.ended {
                    self.playing = false;
                }
            }
            Err(error) => {
                backend.pause();
                self.playing = false;
                self.error = Some(error);
                self.backend = None;
            }
        }
        cx.notify();
        self.playing
    }
}

fn clock(seconds: f64) -> String {
    let seconds = seconds.max(0.).floor() as u64;
    format!("{}:{:02}", seconds / 60, seconds % 60)
}

/// Exercises the real macOS decoder and playback clock without a GUI driver.
#[cfg(target_os = "macos")]
pub fn verify_playback(cx: &mut App) {
    cx.spawn(async move |cx| {
        let result: Result<(), String> = async {
            for sample in [Sample::Video, Sample::Audio] {
                let player = native::Player::new(sample)?;
                player.play();
                let mut frames = Vec::new();
                let mut state = player.poll()?;
                for _ in 0..30 {
                    cx.background_executor()
                        .timer(Duration::from_millis(50))
                        .await;
                    state = player.poll()?;
                    if let Some(frame) = &state.frame {
                        use std::hash::{Hash, Hasher};
                        let mut hash = std::collections::hash_map::DefaultHasher::new();
                        frame.as_bytes(0).hash(&mut hash);
                        frames.push(hash.finish());
                    }
                }
                if state.position < 0.5 {
                    return Err("Playback clock did not advance".into());
                }
                if matches!(sample, Sample::Video) {
                    frames.sort_unstable();
                    frames.dedup();
                    if frames.len() < 5 {
                        return Err("Video did not produce distinct decoded frames".into());
                    }
                }
                player.pause();
                let paused = player.poll()?.position;
                cx.background_executor()
                    .timer(Duration::from_millis(250))
                    .await;
                if (player.poll()?.position - paused).abs() > 0.1 {
                    return Err("Pause did not stop the playback clock".into());
                }
                player.seek(4.);
                cx.background_executor()
                    .timer(Duration::from_millis(250))
                    .await;
                if (player.poll()?.position - 4.).abs() > 0.25 {
                    return Err("Seek did not reach the requested position".into());
                }
                player.rewind();
                player.play();
                cx.background_executor()
                    .timer(Duration::from_millis(250))
                    .await;
                if player.poll()?.position >= paused {
                    return Err("Replay did not rewind".into());
                }
                let mut ended = false;
                for _ in 0..100 {
                    cx.background_executor()
                        .timer(Duration::from_millis(100))
                        .await;
                    if player.poll()?.ended {
                        ended = true;
                        break;
                    }
                }
                if !ended {
                    return Err("Playback did not finish".into());
                }
                println!(
                    "{}: playback, pause, seek, replay and end passed; {} distinct video frames",
                    if matches!(sample, Sample::Video) {
                        "video"
                    } else {
                        "audio"
                    },
                    frames.len()
                );
            }
            Ok(())
        }
        .await;
        if let Err(error) = result {
            eprintln!("media verification failed: {error}");
            std::process::exit(1);
        }
        let _ = cx.update(|cx| cx.quit());
    })
    .detach();
}

fn waveform() -> Vec<f32> {
    // Peaks measured from the bundled mono 16-bit PCM WAV, not decorative bars.
    let bytes = include_bytes!("media/chime.wav");
    let samples = bytes[44..]
        .chunks_exact(2)
        .map(|b| i16::from_le_bytes([b[0], b[1]]).unsigned_abs() as f32 / i16::MAX as f32)
        .collect::<Vec<_>>();
    samples
        .chunks(samples.len().div_ceil(32))
        .map(|chunk| {
            chunk
                .iter()
                .copied()
                .fold(0., f32::max)
                .mul_add(3., 0.)
                .min(1.)
        })
        .collect()
}

impl Render for MediaExample {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let video = matches!(self.sample, Sample::Video);
        let preview = Attachment::new(
            "sample",
            if video {
                "Fractal zoom"
            } else {
                "Gallery chime"
            },
        )
        .kind(if video {
            AttachmentKind::Video {
                duration: Some(
                    format!("{} / {}", clock(self.position), clock(self.duration)).into(),
                ),
            }
        } else {
            AttachmentKind::Audio {
                duration: None,
                waveform: self.waveform.clone(),
            }
        })
        .when(video, |this| this.thumbnail(self.frame.clone()))
        .when(!video, |this| this.meta("Six-note chime · WAV"))
        .playback_progress((self.position / self.duration) as f32)
        .on_seek(cx.listener(|this, fraction: &f32, _, cx| {
            #[cfg(target_os = "macos")]
            {
                if this.backend.is_none() {
                    match native::Player::new(this.sample) {
                        Ok(player) => this.backend = Some(player),
                        Err(error) => {
                            this.error = Some(error);
                            cx.notify();
                            return;
                        }
                    }
                }
                let position = f64::from(*fraction) * this.duration;
                // Start/resume before seeking, so seeking to the end is not
                // mistaken for pressing Play on a completed clip.
                this.play(cx);
                this.backend.as_ref().unwrap().seek(position);
                this.position = position;
                cx.notify();
            }
        }))
        .playing(self.playing)
        .on_action(cx.listener(|this, _, _, cx| this.toggle(cx)))
        .preview();
        v_flex()
            .w(rems(if video { 15. } else { 16.25 }))
            .gap_2()
            .child(preview)
            .when(!video, |this| {
                this.child(
                    div().h_1().rounded_full().bg(cx.theme().muted).child(
                        div()
                            .h_full()
                            .rounded_full()
                            .bg(cx.theme().primary)
                            .w(relative(
                                (self.position / self.duration).clamp(0., 1.) as f32
                            )),
                    ),
                )
            })
            .child(
                h_flex()
                    .justify_between()
                    .text_xs()
                    .text_color(cx.theme().muted_foreground)
                    .when(!video, |this| {
                        this.child(format!(
                            "{} / {}",
                            clock(self.position),
                            clock(self.duration)
                        ))
                    })
                    .child(
                        Button::new("replay")
                            .ghost()
                            .xsmall()
                            .label("Replay")
                            .on_click(cx.listener(|this, _, _, cx| {
                                this.pause(cx);
                                #[cfg(target_os = "macos")]
                                if let Some(backend) = &this.backend {
                                    backend.rewind();
                                }
                                this.position = 0.;
                                this.play(cx);
                            })),
                    ),
            )
            .when_some(self.error.clone(), |this, error| {
                this.child(div().text_xs().text_color(cx.theme().danger).child(error))
            })
    }
}

#[cfg(test)]
mod tests {
    use super::{clock, waveform};

    #[test]
    fn audio_peaks_come_from_the_eight_second_sample() {
        assert_eq!(
            (include_bytes!("media/chime.wav").len() - 44) / 2,
            22050 * 8
        );
        let peaks = waveform();
        assert_eq!(peaks.len(), 32);
        assert!(peaks.iter().any(|peak| *peak > 0.5));
        assert!(peaks.iter().all(|peak| (0.0..=1.0).contains(peak)));
        assert_eq!(clock(8.), "0:08");
    }
}

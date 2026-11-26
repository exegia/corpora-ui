//! AVFoundation decoding. All calls and retained objects stay on GPUI's main
//! thread. Pixels are copied while locked; no native buffer escapes the poll.

use gpui_kit::RenderImage;
use objc2::{AnyThread as _, MainThreadMarker, rc::Retained, runtime::AnyObject};
use objc2_av_foundation::{AVPlayer, AVPlayerItem, AVPlayerItemVideoOutput, AVPlayerStatus};
use objc2_core_media::CMTime;
use objc2_core_video::*;
use objc2_foundation::{NSDictionary, NSNumber, NSString, NSURL};
use std::{sync::Arc, time::Instant};

use super::Sample;

pub struct Player {
    player: Retained<AVPlayer>,
    item: Retained<AVPlayerItem>,
    output: Option<Retained<AVPlayerItemVideoOutput>>,
    _files: tempfile::TempDir,
    created: Instant,
}

pub struct State {
    pub position: f64,
    pub duration: f64,
    pub ended: bool,
    pub frame: Option<Arc<RenderImage>>,
}

impl Player {
    pub fn new(sample: Sample) -> Result<Self, String> {
        let mtm = MainThreadMarker::new().ok_or("Playback must start on the main thread")?;
        let files = tempfile::tempdir().map_err(|error| error.to_string())?;
        let (name, bytes): (_, &[u8]) = match sample {
            Sample::Video => ("fractal-zoom.mp4", include_bytes!("fractal-zoom.mp4")),
            Sample::Audio => ("chime.wav", include_bytes!("chime.wav")),
        };
        let path = files.path().join(name);
        std::fs::write(&path, bytes).map_err(|error| error.to_string())?;
        let url = NSURL::fileURLWithPath(&NSString::from_str(&path.to_string_lossy()));
        // SAFETY: called on the main thread; the local file remains alive for
        // the player's lifetime, and the dictionary requests packed BGRA.
        unsafe {
            let item = AVPlayerItem::playerItemWithURL(&url, mtm);
            let output = if matches!(sample, Sample::Video) {
                let key = NSString::from_str("PixelFormatType");
                let value = NSNumber::numberWithUnsignedInt(kCVPixelFormatType_32BGRA);
                let attributes =
                    NSDictionary::<NSString, AnyObject>::from_slices(&[&*key], &[&*value]);
                let output = AVPlayerItemVideoOutput::initWithPixelBufferAttributes(
                    AVPlayerItemVideoOutput::alloc(),
                    Some(&attributes),
                );
                output.setSuppressesPlayerRendering(true);
                item.addOutput(&output);
                Some(output)
            } else {
                None
            };
            let player = AVPlayer::playerWithPlayerItem(Some(&item), mtm);
            player.setVolume(0.6);
            Ok(Self {
                player,
                item,
                output,
                _files: files,
                created: Instant::now(),
            })
        }
    }

    pub fn play(&self) {
        // SAFETY: Player is main-thread-only through its retained AVPlayer.
        unsafe { self.player.play() }
    }

    pub fn pause(&self) {
        // SAFETY: see play().
        unsafe { self.player.pause() }
    }

    pub fn seek(&self, seconds: f64) {
        // SAFETY: finite nonnegative position on the main thread.
        unsafe {
            self.player.seekToTime_toleranceBefore_toleranceAfter(
                CMTime::with_seconds(seconds.max(0.), 600),
                CMTime::with_seconds(0., 600),
                CMTime::with_seconds(0., 600),
            )
        }
    }

    pub fn rewind(&self) {
        // SAFETY: finite time, valid time scale, main thread.
        unsafe { self.player.seekToTime(CMTime::with_seconds(0., 600)) }
    }

    pub fn poll(&self) -> Result<State, String> {
        // SAFETY: retained AVFoundation objects are only read on the main
        // thread. The copied pixel buffer is read only under its lock.
        unsafe {
            if self.player.status() == AVPlayerStatus::Failed {
                return Err(self
                    .player
                    .error()
                    .map(|e| e.localizedDescription().to_string())
                    .unwrap_or_else(|| "The sample could not be played.".into()));
            }
            if self.player.status() == AVPlayerStatus::Unknown
                && self.created.elapsed().as_secs() > 10
            {
                return Err("The sample did not finish loading. Press Play to retry.".into());
            }
            let time = self.player.currentTime();
            let position = time.seconds();
            let duration = self.item.duration().seconds();
            let position = if position.is_finite() {
                position.max(0.)
            } else {
                0.
            };
            let duration = if duration.is_finite() && duration > 0. {
                duration
            } else {
                8.
            };
            let frame = self.output.as_ref().and_then(|output| {
                if !output.hasNewPixelBufferForItemTime(time) {
                    return None;
                }
                let buffer = output
                    .copyPixelBufferForItemTime_itemTimeForDisplay(time, std::ptr::null_mut())?;
                if CVPixelBufferGetPixelFormatType(&buffer) != kCVPixelFormatType_32BGRA {
                    return None;
                }
                let flags = CVPixelBufferLockFlags::ReadOnly;
                if CVPixelBufferLockBaseAddress(&buffer, flags) != 0 {
                    return None;
                }
                let width = CVPixelBufferGetWidth(&buffer);
                let height = CVPixelBufferGetHeight(&buffer);
                let stride = CVPixelBufferGetBytesPerRow(&buffer);
                let base = CVPixelBufferGetBaseAddress(&buffer).cast::<u8>();
                let result = if !base.is_null() && width > 0 && height > 0 && stride >= width * 4 {
                    let mut pixels = Vec::with_capacity(width * height * 4);
                    for row in 0..height {
                        pixels.extend_from_slice(std::slice::from_raw_parts(
                            base.add(row * stride),
                            width * 4,
                        ));
                    }
                    image::RgbaImage::from_raw(width as u32, height as u32, pixels)
                        .map(|image| Arc::new(RenderImage::new(vec![image::Frame::new(image)])))
                } else {
                    None
                };
                CVPixelBufferUnlockBaseAddress(&buffer, flags);
                result
            });
            Ok(State {
                position: position.min(duration),
                duration,
                ended: position >= duration - 0.04 && self.player.rate() == 0.,
                frame,
            })
        }
    }
}

impl Drop for Player {
    fn drop(&mut self) {
        self.pause();
    }
}

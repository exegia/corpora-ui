"use client"

import { defineStory } from "@/registry/story"

import { LoginBlock } from "./login-block"

export const story = defineStory({
  Component: LoginBlock,
  args: {
    initial: {
      title: "Login to your account",
      showRememberMe: true,
      showForgotPassword: true,
    },
  },
})

export const Preview = story.WithControl

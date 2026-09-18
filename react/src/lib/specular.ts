import { defineSurfaces } from "@exegia/specular"

export const surfaces = defineSurfaces({
  bezel: {
    layers: {
      lit: { color: "#fff" },
      dim: { color: "#000" },
    },
  },
})

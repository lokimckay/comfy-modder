# Comfy Modder

Replace inputs in your ComfyUI workflows

## Usage

1. Install ComfyUI
1. Add `--enable-cors-header *` to commandline options of `run_nvidia_gpu.bat`
1. Start ComfyUI by running `run_nvidia_gpu.bat`
1. Create a workflow that generates an image
1. Enable devtools in the ComfyUI settings menu
1. Save the workflow in API format
1. Open [lokimckay.github.io/comfy-modder/](https://lokimckay.github.io/comfy-modder/)
1. Copy and paste the API formatted workflow into comfy modder
1. Configure replacements and settings in comfy modder
1. Click generate

## Roadmap

- [ ] presets
- [ ] prompt S/R instead of full replace
- [ ] append / prepend to value instead of full replace
- [ ] Loglevel setting
- [ ] Reset button for `replace with` field that resets to workflow value

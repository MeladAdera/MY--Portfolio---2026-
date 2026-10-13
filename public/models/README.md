# Models

`engineer.glb` is the person at the worktable on the Home page. It is a humanoid glTF with the
Ready Player Me / Mixamo skeleton (`Hips`, `Spine`, `LeftArm`, `LeftHandIndex1`, …). The scene
does not play any animation stored in the file; `src/three/shared/skinned-rig.js` poses the
skeleton every frame from the scene's own motion, so any avatar with that skeleton moves the
same way.

The current file is the sample avatar shipped with the three.js examples
(`examples/models/gltf/readyplayer.me.glb`), a Ready Player Me character. Its hat is hidden by
name in `src/features/home/hooks/use-home-scene.ts`.

## Replacing the person

1. Make an avatar at https://readyplayer.me (a photo is enough) and download it as `.glb`
   (full body, T-pose). Plain clothes and short hair draw cleanest in the pencil style.
2. Save it as `public/models/engineer.glb`.
3. If the avatar wears headwear, keep its mesh name in the `hide` list of `FIGURE`; otherwise
   empty the list.

Keep the file small (a few megabytes at most): it is downloaded by every visitor who sees the
Home page.

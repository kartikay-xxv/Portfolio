import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGE_REGEX = /\.(png|jpe?g|webp|gif|avif)$/i;

const galleryManifestPlugin = () => {
  const virtualModuleId = "virtual:gallery-folders";
  const resolvedVirtualId = `\0${virtualModuleId}`;
  const galleryDir = resolve(__dirname, "public/images/Gallery");

  const scanGallery = () => {
    const manifest = {};
    if (!fs.existsSync(galleryDir)) return manifest;

    const folders = fs
      .readdirSync(galleryDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    for (const folder of folders) {
      const folderPath = join(galleryDir, folder);
      const files = fs
        .readdirSync(folderPath, { withFileTypes: true })
        .filter((entry) => entry.isFile() && IMAGE_REGEX.test(entry.name))
        .map((entry) => entry.name)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

      manifest[folder] = files.map((file) => ({
        name: file,
        img: `/images/Gallery/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`,
      }));
    }

    return manifest;
  };

  return {
    name: "gallery-manifest",
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualId;
    },
    load(id) {
      if (id === resolvedVirtualId) {
        return `export default ${JSON.stringify(scanGallery())};`;
      }
    },
    configureServer(server) {
      const reloadIfGallery = (filePath) => {
        if (!filePath.startsWith(galleryDir)) return;
        const mod = server.moduleGraph.getModuleById(resolvedVirtualId);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };

      server.watcher.on("add", reloadIfGallery);
      server.watcher.on("unlink", reloadIfGallery);
      server.watcher.on("addDir", reloadIfGallery);
      server.watcher.on("unlinkDir", reloadIfGallery);
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), galleryManifestPlugin()],
  resolve: {
    alias: {
      "#components": resolve(__dirname, "src/components"),
      "#constants": resolve(__dirname, "src/constants"),
      "#store": resolve(__dirname, "src/store"),
      "#hoc": resolve(__dirname, "src/hoc"),
      "#windows": resolve(__dirname, "src/windows"),
    },
  },
});
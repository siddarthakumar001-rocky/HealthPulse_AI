import { Capacitor } from "@capacitor/core";

export interface AppReleaseInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseName: string;
  releaseNotes: string[];
  publishedAt: string;
  apkDownloadUrl: string;
  githubReleaseUrl: string;
  websiteUrl: string;
  isMandatory?: boolean;
}

// Current installed application version
export const CURRENT_APP_VERSION = "1.1.0";

// GitHub repository details (can be configured via environment or fallback)
const GITHUB_OWNER = "siddarthakumar001-rocky";
const GITHUB_REPO = "HealthPulse_AI";
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
const GITHUB_RELEASES_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;
const DEFAULT_WEBSITE_URL = typeof window !== "undefined" ? window.location.origin : "https://pulse-ai-gamma.vercel.app";

/**
 * Compare two semver strings (e.g., "1.0.1" > "1.0.0")
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export function compareSemver(v1: string, v2: string): number {
  const clean1 = (v1 || "").replace(/^v/i, "").trim();
  const clean2 = (v2 || "").replace(/^v/i, "").trim();

  const parts1 = clean1.split(".").map((n) => parseInt(n, 10) || 0);
  const parts2 = clean2.split(".").map((n) => parseInt(n, 10) || 0);

  const len = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < len; i++) {
    const p1 = parts1[i] ?? 0;
    const p2 = parts2[i] ?? 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

export const updateService = {
  getCurrentVersion(): string {
    return CURRENT_APP_VERSION;
  },

  isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
  },

  /**
   * Check for the latest release via GitHub API with fallback to the backend update manifest
   */
  async checkForUpdates(): Promise<AppReleaseInfo> {
    const currentVersion = CURRENT_APP_VERSION;

    // 1. Attempt GitHub Releases API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(GITHUB_API_URL, {
        headers: { Accept: "application/vnd.github.v3+json" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const latestTag = (data.tag_name || data.name || "1.0.0").replace(/^v/i, "");
        const hasUpdate = compareSemver(latestTag, currentVersion) > 0;

        // Find APK asset if present in GitHub release assets
        let apkUrl = "";
        if (Array.isArray(data.assets)) {
          const apkAsset = data.assets.find(
            (a: any) => typeof a.name === "string" && a.name.endsWith(".apk")
          );
          if (apkAsset?.browser_download_url) {
            apkUrl = apkAsset.browser_download_url;
          }
        }
        if (!apkUrl) {
          apkUrl = `${GITHUB_RELEASES_URL}/download/app-release.apk`;
        }

        const notes = (data.body || "")
          .split("\n")
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0 && !line.startsWith("#"))
          .map((line: string) => line.replace(/^[-*]\s*/, ""));

        return {
          hasUpdate,
          currentVersion,
          latestVersion: latestTag,
          releaseName: data.name || `Release v${latestTag}`,
          releaseNotes: notes.length > 0 ? notes : ["Performance, stability, and security updates."],
          publishedAt: data.published_at || new Date().toISOString(),
          apkDownloadUrl: apkUrl,
          githubReleaseUrl: data.html_url || GITHUB_RELEASES_URL,
          websiteUrl: DEFAULT_WEBSITE_URL,
          isMandatory: false,
        };
      }
    } catch (ghErr) {
      console.warn("[UpdateService] GitHub API check unavailable, falling back to server manifest:", ghErr);
    }

    // 2. Fallback to backend /api/app/version endpoint
    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const endpoint = `${apiBase.replace(/\/api\/?$/, "")}/api/app/version`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const latestVersion = (data.latestVersion || "1.0.0").replace(/^v/i, "");
        const hasUpdate = compareSemver(latestVersion, currentVersion) > 0;

        return {
          hasUpdate,
          currentVersion,
          latestVersion,
          releaseName: data.releaseName || `HealthPulse AI v${latestVersion}`,
          releaseNotes: Array.isArray(data.releaseNotes) ? data.releaseNotes : ["General stability and performance updates"],
          publishedAt: data.publishedAt || new Date().toISOString(),
          apkDownloadUrl: data.apkUrl || `${GITHUB_RELEASES_URL}/download/app-release.apk`,
          githubReleaseUrl: data.releaseUrl || GITHUB_RELEASES_URL,
          websiteUrl: data.websiteUrl || DEFAULT_WEBSITE_URL,
          isMandatory: Boolean(data.mandatory),
        };
      }
    } catch (serverErr) {
      console.warn("[UpdateService] Server version check unavailable:", serverErr);
    }

    // 3. Fallback: app is up to date
    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion,
      releaseName: `HealthPulse AI v${currentVersion}`,
      releaseNotes: ["You are running the most recent production release."],
      publishedAt: new Date().toISOString(),
      apkDownloadUrl: `${GITHUB_RELEASES_URL}/download/app-release.apk`,
      githubReleaseUrl: GITHUB_RELEASES_URL,
      websiteUrl: DEFAULT_WEBSITE_URL,
      isMandatory: false,
    };
  },

  /**
   * Triggers the APK download or redirects to release download page
   */
  downloadAndInstall(url: string) {
    if (!url) return;
    try {
      if (Capacitor.isNativePlatform()) {
        // On native Android, opening in system browser or target=_blank initiates the download
        window.open(url, "_system");
      } else {
        // In browser, create a direct download anchor or open link
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("[UpdateService] Download trigger error:", err);
      window.location.href = url;
    }
  },
};

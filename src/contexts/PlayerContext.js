"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import spotifyAPI from "@/lib/spotify";
import { spotifyTrackToPlayerFormat } from "@/lib/musicData";

const PlayerContext = createContext(null);

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function stateToCurrentTrack(state) {
  return spotifyTrackToPlayerFormat({
    id: state.id,
    name: state.name,
    artist: state.artist,
    album: state.album,
    images: state.images,
    duration_ms: state.duration_ms,
    duration_formatted: spotifyAPI.formatDuration(state.duration_ms),
    preview_url: state.preview_url,
    uri: state.uri,
    external_urls: state.external_urls,
  });
}

function shuffleRest(tracks, currentId) {
  const current = currentId ? tracks.find((t) => t.id === currentId) : null;
  const rest = tracks.filter((t) => t.id !== currentId);
  for (let i = rest.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return current ? [current, ...rest] : rest;
}

export function PlayerProvider({ children }) {
  const audioRef = useRef(null);
  const queueRef = useRef([]);
  const originalQueueRef = useRef([]);
  const queueIndexRef = useRef(0);
  const playbackModeRef = useRef(null);
  const currentTimeRef = useRef(0);
  const pausedPositionRef = useRef(0);
  const skipPollUntilRef = useRef(0);
  const seekTargetRef = useRef(null);
  const shuffleRef = useRef(false);
  const repeatModeRef = useRef("off");
  const wasPlayingRef = useRef(false);
  const handlingEndRef = useRef(false);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.72);
  const [queueLength, setQueueLength] = useState(0);
  const [queueTracks, setQueueTracks] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [playbackMode, setPlaybackMode] = useState(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");
  const [isLiked, setIsLiked] = useState(false);

  const updateCurrentTime = useCallback((seconds) => {
    currentTimeRef.current = seconds;
    setCurrentTime(seconds);
  }, []);

  const syncQueueState = useCallback((tracks, index) => {
    queueRef.current = tracks;
    setQueueLength(tracks.length);
    setQueueTracks(tracks.map((t) => spotifyTrackToPlayerFormat(t)));
    queueIndexRef.current = index;
    setQueueIndex(index);
  }, []);

  const applySpotifyState = useCallback(
    (state) => {
      if (!state) return;

      setCurrentTrack(stateToCurrentTrack(state));
      updateCurrentTime((state.progress_ms || 0) / 1000);
      if (state.duration_ms) {
        setDuration(state.duration_ms / 1000);
      }
      setIsPlaying(state.is_playing ?? false);
      playbackModeRef.current = "spotify";
      setPlaybackMode("spotify");

      const idx = queueRef.current.findIndex((t) => t.id === state.id);
      if (idx >= 0 && idx !== queueIndexRef.current) {
        queueIndexRef.current = idx;
        setQueueIndex(idx);
      }
    },
    [updateCurrentTime]
  );

  const getNextIndex = useCallback(() => {
    const len = queueRef.current.length;
    if (len === 0) return -1;

    if (repeatModeRef.current === "one") {
      return queueIndexRef.current;
    }

    if (shuffleRef.current) {
      if (len === 1) return 0;
      let idx;
      do {
        idx = Math.floor(Math.random() * len);
      } while (idx === queueIndexRef.current);
      return idx;
    }

    const next = queueIndexRef.current + 1;
    if (next < len) return next;
    if (repeatModeRef.current === "all") return 0;
    return -1;
  }, []);

  const playTrackAtIndex = useCallback(
    async (index) => {
      const queue = queueRef.current;
      const track = queue[index];
      if (!track) return;

      queueIndexRef.current = index;
      setQueueIndex(index);
      const formatted = spotifyTrackToPlayerFormat(track);
      setCurrentTrack(formatted);
      updateCurrentTime(0);
      pausedPositionRef.current = 0;
      playbackModeRef.current = null;
      setPlaybackMode(null);
      handlingEndRef.current = false;

      const audio = audioRef.current;
      if (!audio) return;

      audio.pause();
      audio.src = "";

      if (track.preview_url) {
        playbackModeRef.current = "preview";
        setPlaybackMode("preview");
        audio.src = track.preview_url;
        try {
          setIsPlaying(true);
          await audio.play();
          return;
        } catch (error) {
          console.error("Preview playback failed:", error);
          setIsPlaying(false);
          audio.pause();
          audio.src = "";
        }
      }

      if (track.uri) {
        playbackModeRef.current = "spotify";
        setPlaybackMode("spotify");
        setIsPlaying(true);
        skipPollUntilRef.current = Date.now() + 2000;

        const played = await spotifyAPI.playTrack(track.uri);
        if (played) {
          if (track.duration_ms) {
            setDuration(track.duration_ms / 1000);
          }
          const state = await spotifyAPI.getPlayerState();
          if (state) {
            applySpotifyState(state);
          }
          return;
        }
        setIsPlaying(false);
      }

      playbackModeRef.current = null;
      setPlaybackMode(null);
      setIsPlaying(false);
    },
    [applySpotifyState, updateCurrentTime]
  );

  const handleTrackEnd = useCallback(async () => {
    if (handlingEndRef.current) return;
    handlingEndRef.current = true;

    try {
      const nextIndex = getNextIndex();
      if (nextIndex >= 0) {
        await playTrackAtIndex(nextIndex);
      } else {
        setIsPlaying(false);
        updateCurrentTime(0);
      }
    } finally {
      handlingEndRef.current = false;
    }
  }, [getNextIndex, playTrackAtIndex, updateCurrentTime]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (playbackModeRef.current === "preview") {
        updateCurrentTime(audio.currentTime);
      }
    };
    const onLoadedMetadata = () => {
      if (playbackModeRef.current === "preview") {
        setDuration(audio.duration || 0);
      }
    };
    const onEnded = () => {
      if (playbackModeRef.current !== "preview") return;
      handleTrackEnd();
    };
    const onPlay = () => {
      if (playbackModeRef.current === "preview") {
        setIsPlaying(true);
      }
    };
    const onPause = () => {
      if (playbackModeRef.current === "preview") {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
      audio.src = "";
    };
  }, [handleTrackEnd, updateCurrentTime]);

  useEffect(() => {
    let cancelled = false;

    const syncInitial = async () => {
      const token = await spotifyAPI.getAccessToken();
      if (!token || cancelled) return;

      const state = await spotifyAPI.getPlayerState();
      if (state?.is_playing) {
        applySpotifyState(state);
      }
    };

    syncInitial();

    return () => {
      cancelled = true;
    };
  }, [applySpotifyState]);

  useEffect(() => {
    if (playbackMode !== "spotify") return;

    let cancelled = false;

    const poll = async () => {
      if (Date.now() < skipPollUntilRef.current && seekTargetRef.current == null) {
        return;
      }

      const state = await spotifyAPI.getPlayerState();
      if (cancelled || !state) return;

      if (state.duration_ms) {
        setDuration(state.duration_ms / 1000);
      }
      setIsPlaying(state.is_playing ?? false);

      if (seekTargetRef.current != null) {
        const targetSec = seekTargetRef.current;
        const actualSec = (state.progress_ms || 0) / 1000;
        if (Math.abs(actualSec - targetSec) < 1.5) {
          seekTargetRef.current = null;
          updateCurrentTime(actualSec);
        } else {
          updateCurrentTime(targetSec);
        }
      } else if (Date.now() >= skipPollUntilRef.current) {
        updateCurrentTime((state.progress_ms || 0) / 1000);
      }

      const nearEnd =
        state.duration_ms &&
        state.progress_ms >= state.duration_ms - 800;

      if (
        wasPlayingRef.current &&
        !state.is_playing &&
        nearEnd &&
        !handlingEndRef.current
      ) {
        await handleTrackEnd();
      }

      wasPlayingRef.current = state.is_playing ?? false;

      if (state.id && state.id !== currentTrack?.id) {
        applySpotifyState(state);
      }
    };

    poll();
    const intervalId = setInterval(poll, 500);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [
    playbackMode,
    currentTrack?.id,
    applySpotifyState,
    updateCurrentTime,
    handleTrackEnd,
  ]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    let cancelled = false;

    const checkLiked = async () => {
      if (!currentTrack?.id) {
        setIsLiked(false);
        return;
      }

      const token = await spotifyAPI.getAccessToken();
      if (!token || cancelled) return;

      const saved = await spotifyAPI.checkSavedTracks([currentTrack.id]);
      if (!cancelled) {
        setIsLiked(saved[0] ?? false);
      }
    };

    checkLiked();

    return () => {
      cancelled = true;
    };
  }, [currentTrack?.id]);

  const playQueue = useCallback(
    async (tracks, startIndex = 0) => {
      const playable = tracks.filter(Boolean);
      if (playable.length === 0) return;

      originalQueueRef.current = playable;
      const ordered = shuffleRef.current
        ? shuffleRest(playable, playable[startIndex]?.id)
        : playable;
      syncQueueState(ordered, shuffleRef.current ? 0 : startIndex);
      await playTrackAtIndex(shuffleRef.current ? 0 : startIndex);
    },
    [playTrackAtIndex, syncQueueState]
  );

  const playTrack = useCallback(
    async (track, contextQueue) => {
      if (contextQueue?.length) {
        const index = contextQueue.findIndex((t) => t.id === track.id);
        await playQueue(contextQueue, index >= 0 ? index : 0);
      } else {
        originalQueueRef.current = [track];
        syncQueueState([track], 0);
        await playTrackAtIndex(0);
      }
    },
    [playQueue, playTrackAtIndex, syncQueueState]
  );

  const playFromQueue = useCallback(
    async (index) => {
      if (index >= 0 && index < queueRef.current.length) {
        await playTrackAtIndex(index);
      }
    },
    [playTrackAtIndex]
  );

  const toggleShuffle = useCallback(() => {
    const next = !shuffleRef.current;
    shuffleRef.current = next;
    setShuffle(next);

    const original = originalQueueRef.current;
    if (original.length === 0) return;

    const currentId = queueRef.current[queueIndexRef.current]?.id;
    const ordered = next
      ? shuffleRest(original, currentId)
      : [...original];
    const newIndex = ordered.findIndex((t) => t.id === currentId);
    syncQueueState(ordered, newIndex >= 0 ? newIndex : 0);
  }, [syncQueueState]);

  const toggleRepeat = useCallback(() => {
    const next = (() => {
      switch (repeatModeRef.current) {
        case "off":
          return "all";
        case "all":
          return "one";
        case "one":
          return "off";
        default:
          throw new Error(`Unexpected repeat mode: ${repeatModeRef.current}`);
      }
    })();
    repeatModeRef.current = next;
    setRepeatMode(next);
  }, []);

  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!currentTrack) return;

    const mode =
      playbackModeRef.current ??
      (currentTrack.uri ? "spotify" : currentTrack.preview_url ? "preview" : null);

    if (mode === "preview") {
      if (!audio) return;
      if (isPlaying) {
        audio.pause();
        const pausedAt = audio.currentTime;
        pausedPositionRef.current = pausedAt;
        updateCurrentTime(pausedAt);
        setIsPlaying(false);
      } else {
        audio.currentTime = pausedPositionRef.current;
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Resume failed:", error);
          setIsPlaying(false);
        }
      }
      return;
    }

    if (mode === "spotify" && currentTrack.uri) {
      skipPollUntilRef.current = Date.now() + 2500;
      seekTargetRef.current = null;

      if (isPlaying) {
        const paused = await spotifyAPI.pausePlayback();
        if (!paused) return;

        const state = await spotifyAPI.getPlayerState();
        if (state) {
          const sec = (state.progress_ms || 0) / 1000;
          pausedPositionRef.current = sec;
          updateCurrentTime(sec);
          setIsPlaying(state.is_playing ?? false);
          wasPlayingRef.current = state.is_playing ?? false;
        } else {
          setIsPlaying(false);
          wasPlayingRef.current = false;
        }
      } else {
        const resumeMs = Math.floor(pausedPositionRef.current * 1000);
        let resumed = await spotifyAPI.resumePlayback();
        if (!resumed) {
          resumed = await spotifyAPI.playTrack(currentTrack.uri, resumeMs);
        }
        if (!resumed) return;

        const state = await spotifyAPI.getPlayerState();
        if (state) {
          const sec = (state.progress_ms || 0) / 1000;
          pausedPositionRef.current = sec;
          updateCurrentTime(sec);
          setIsPlaying(state.is_playing ?? true);
          wasPlayingRef.current = state.is_playing ?? true;
        } else {
          setIsPlaying(true);
          wasPlayingRef.current = true;
        }
      }
    }
  }, [currentTrack, isPlaying, updateCurrentTime]);

  const playNext = useCallback(async () => {
    const len = queueRef.current.length;
    if (len > 0) {
      let nextIndex = -1;

      if (shuffleRef.current) {
        if (len === 1) {
          await playTrackAtIndex(0);
          return;
        }
        do {
          nextIndex = Math.floor(Math.random() * len);
        } while (nextIndex === queueIndexRef.current);
      } else {
        nextIndex = queueIndexRef.current + 1;
        if (nextIndex >= len) {
          nextIndex = repeatModeRef.current === "all" ? 0 : -1;
        }
      }

      if (nextIndex >= 0) {
        await playTrackAtIndex(nextIndex);
        return;
      }
    }

    if (playbackModeRef.current === "spotify") {
      skipPollUntilRef.current = Date.now() + 2000;
      await spotifyAPI.skipToNext();
      const state = await spotifyAPI.getPlayerState();
      if (state) applySpotifyState(state);
    }
  }, [applySpotifyState, playTrackAtIndex]);

  const playPrevious = useCallback(async () => {
    const audio = audioRef.current;

    if (
      playbackModeRef.current === "preview" &&
      audio &&
      audio.currentTime > 3
    ) {
      audio.currentTime = 0;
      updateCurrentTime(0);
      pausedPositionRef.current = 0;
      return;
    }

    if (
      playbackModeRef.current === "spotify" &&
      currentTimeRef.current > 3
    ) {
      skipPollUntilRef.current = Date.now() + 1500;
      await spotifyAPI.seekPlayback(0);
      updateCurrentTime(0);
      pausedPositionRef.current = 0;
      return;
    }

    const prevIndex = queueIndexRef.current - 1;
    if (prevIndex >= 0) {
      await playTrackAtIndex(prevIndex);
      return;
    }

    if (playbackModeRef.current === "spotify") {
      skipPollUntilRef.current = Date.now() + 2000;
      await spotifyAPI.skipToPrevious();
      const state = await spotifyAPI.getPlayerState();
      if (state) applySpotifyState(state);
    }
  }, [applySpotifyState, playTrackAtIndex, updateCurrentTime]);

  const seek = useCallback(
    (fraction) => {
      if (!duration) return;

      const time = Math.max(0, Math.min(duration, fraction * duration));
      pausedPositionRef.current = time;
      updateCurrentTime(time);

      if (playbackModeRef.current === "preview") {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = time;
        return;
      }

      if (playbackModeRef.current === "spotify") {
        seekTargetRef.current = time;
        skipPollUntilRef.current = Date.now() + 800;
        spotifyAPI.seekPlayback(time * 1000).catch((error) => {
          console.error("Seek failed:", error);
          seekTargetRef.current = null;
        });
      }
    },
    [duration, updateCurrentTime]
  );

  const setVolumeLevel = useCallback((level) => {
    const v = Math.max(0, Math.min(1, level));
    setVolume(v);
    if (playbackModeRef.current === "spotify") {
      spotifyAPI.setDeviceVolume(v * 100);
    }
  }, []);

  const toggleLike = useCallback(async () => {
    if (!currentTrack?.id) return;

    const token = await spotifyAPI.getAccessToken();
    if (!token) return;

    if (isLiked) {
      const ok = await spotifyAPI.removeSavedTrack(currentTrack.id);
      if (ok) setIsLiked(false);
    } else {
      const ok = await spotifyAPI.saveTrack(currentTrack.id);
      if (ok) setIsLiked(true);
    }
  }, [currentTrack?.id, isLiked]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const value = {
    currentTrack,
    isPlaying,
    playbackMode,
    currentTime: formatTime(currentTime),
    duration:
      duration > 0 ? formatTime(duration) : currentTrack?.duration || "0:00",
    progress,
    durationSeconds: duration,
    volume,
    queueLength,
    queueTracks,
    queueIndex,
    shuffle,
    repeatMode,
    isLiked,
    playTrack,
    playQueue,
    playFromQueue,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setVolume: setVolumeLevel,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}

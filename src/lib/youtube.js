// YouTube Data API v3 integration for music search and playback
// Get your API key from: https://console.developers.google.com/

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || 'your-youtube-api-key';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

class YouTubeAPI {
  constructor() {
    this.apiKey = YOUTUBE_API_KEY;
  }

  // Search for music videos
  async searchMusic(query, maxResults = 20) {
    try {
      const response = await fetch(
        `${YOUTUBE_API_BASE}/search?` +
        `part=snippet&` +
        `q=${encodeURIComponent(query + ' music')}&` +
        `type=video&` +
        `videoCategoryId=10&` + // Music category
        `maxResults=${maxResults}&` +
        `key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        publishedAt: item.snippet.publishedAt,
        videoId: item.id.videoId,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
        watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));
    } catch (error) {
      console.error('YouTube search error:', error);
      return [];
    }
  }

  // Get video details
  async getVideoDetails(videoId) {
    try {
      const response = await fetch(
        `${YOUTUBE_API_BASE}/videos?` +
        `part=snippet,contentDetails&` +
        `id=${videoId}&` +
        `key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.items.length === 0) return null;

      const video = data.items[0];
      return {
        id: video.id,
        title: video.snippet.title,
        channelTitle: video.snippet.channelTitle,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url,
        duration: video.contentDetails.duration,
        publishedAt: video.snippet.publishedAt,
        embedUrl: `https://www.youtube.com/embed/${video.id}`,
        watchUrl: `https://www.youtube.com/watch?v=${video.id}`
      };
    } catch (error) {
      console.error('YouTube video details error:', error);
      return null;
    }
  }

  // Format duration from ISO 8601 to readable format
  formatDuration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Create singleton instance
const youtubeAPI = new YouTubeAPI();

export default youtubeAPI;
export { YouTubeAPI };



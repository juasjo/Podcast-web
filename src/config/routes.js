export const ROUTES = {
  api: {
    episodes: "/api/episodes",
    episodeById: (id) => `/api/episodes/${id}`,
    episodeAudio: (id) => `/api/episodes/${id}/audio`
  },
  feed: "/feed.xml",
  web: {
    home: "/",
    episodeDetail: (id) => `/episodes/${id}`
  }
};

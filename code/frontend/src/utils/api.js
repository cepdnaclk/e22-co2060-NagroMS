import { auth } from "./firebase";

const BASE_URL = "http://localhost:5000/api";

/**
 * Makes an authenticated API call to the backend.
 * Automatically gets the current user's Firebase ID token
 * and sends it in the Authorization header.
 */
export async function apiCall(endpoint, options = {}) {
  const user = auth.currentUser;

  if (!user) throw new Error("Not logged in");

  // Get fresh token
  const token = await user.getIdToken();

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "API call failed");
  }

  return response.json();
}

// ── Expert API helpers ────────────────────────────────

// Dashboard
export const getDashboardStats       = ()             => apiCall("/expert/dashboard");

// Consultations
export const getConsultations        = ()             => apiCall("/expert/consultations");
export const updateConsultationStatus = (id, status) => apiCall(`/expert/consultations/${id}/status`, {
  method: "PUT", body: JSON.stringify({ status }),
});

// Q&A Forum
export const getQuestions            = ()             => apiCall("/expert/questions");
export const replyToQuestion         = (id, text)    => apiCall(`/expert/questions/${id}/reply`, {
  method: "POST", body: JSON.stringify({ text }),
});

// Knowledge Base
export const getArticles             = ()             => apiCall("/expert/articles");
export const createArticle           = (data)        => apiCall("/expert/articles", {
  method: "POST", body: JSON.stringify(data),
});
export const updateArticle           = (id, data)    => apiCall(`/expert/articles/${id}`, {
  method: "PUT", body: JSON.stringify(data),
});
export const deleteArticle           = (id)          => apiCall(`/expert/articles/${id}`, {
  method: "DELETE",
});

// Profile
export const getProfile              = ()             => apiCall("/expert/profile");
export const updateProfile           = (data)        => apiCall("/expert/profile", {
  method: "PUT", body: JSON.stringify(data),
});
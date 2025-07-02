// const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

// export const postFormData = async (endpoint, formData) => {
//   const res = await fetch(`${BASE_URL}${endpoint}`, {
//     method: "POST",
//     body: formData,
//   });
//   if (!res.ok) throw new Error("Failed to fetch from API");
//   return res.json();
// };

// export const postJSON = async (endpoint, jsonBody, format) => {
//   const res = await fetch(`${BASE_URL}${endpoint}?format=${format}`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(jsonBody),
//   });
//   if (!res.ok) throw new Error("Export failed");
//   return res;
// };

const BASE_URL = window._env_?.VITE_APP_BASE_URL;
// const BASE_URL = (window._env_?.VITE_APP_BAS_URL || import.meta.env.VITE_APP_BASE_URL).replace(/\/$/, "");

// const BASE_URL = import.meta.env.VITE_APP_BASE_URL.replace(/\/$/, "");
console.log(BASE_URL)
export const postFormData = async (endpoint, formData) => {
  console.log(formData)
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch from API: ${res.status} ${text}`);
  }
  return res.json();
};


export const postJSON = async (endpoint, jsonBody, format) => {
  const res = await fetch(`${BASE_URL}${endpoint}?format=${format}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jsonBody),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Export failed: ${res.status} ${text}`);
  }
  return res;
};
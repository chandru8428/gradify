const BASE = "http://localhost:8000/api";

export async function callAPI(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("token");
  
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  };
  
  if (body) {
    opts.body = JSON.stringify(body);
  }
  
  try {
    const res = await fetch(BASE + endpoint, opts);
    if (!res.ok) {
        throw new Error(`API Error: ${res.statusText}`);
    }
    return await res.json();
  } catch (e) {
    console.error("API Call Failed", e);
    throw e;
  }
}

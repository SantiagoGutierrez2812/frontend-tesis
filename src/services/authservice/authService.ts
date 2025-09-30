export async function login(username: string, password: string) {
  const res = await fetch("http://127.0.0.1:5000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Error en login");
  }

  return res.json();}

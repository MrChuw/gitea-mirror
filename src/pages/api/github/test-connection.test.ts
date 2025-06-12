import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { POST } from "./test-connection";
import { Octokit } from "@octokit/rest";

// Mock the Octokit class
mock.module("@octokit/rest", () => {
  return {
    Octokit: mock(function() {
      return {
        users: {
          getAuthenticated: mock(() => Promise.resolve({
            data: {
              login: "testuser",
              name: "Test User",
              avatar_url: "https://example.com/avatar.png"
            }
          }))
        }
      };
    })
  };
});

describe("GitHub Test Connection API", () => {
  // Mock console.error to prevent test output noise
  let originalConsoleError: typeof console.error;
  
  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = mock(() => {});
  });
  
  afterEach(() => {
    console.error = originalConsoleError;
  });
  
  test("returns 400 if token is missing", async () => {
    const request = new Request("http://localhost/api/github/test-connection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });
    
    const response = await POST({ request } as any);
    
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toBe("GitHub token is required");
  });
  
  test("returns 200 with user data on successful connection", async () => {
    const request = new Request("http://localhost/api/github/test-connection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token: "valid-token"
      })
    });
    
    const response = await POST({ request } as any);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe("Successfully connected to GitHub as testuser");
    expect(data.user).toEqual({
      login: "testuser",
      name: "Test User",
      avatar_url: "https://example.com/avatar.png"
    });
  });
  
  test("returns 400 if username doesn't match authenticated user", async () => {
    const request = new Request("http://localhost/api/github/test-connection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token: "valid-token",
        username: "differentuser"
      })
    });
    
    const response = await POST({ request } as any);
    
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toBe("Token belongs to testuser, not differentuser");
  });
  
  test("handles authentication errors", async () => {
    // Mock Octokit to throw an error
    mock.module("@octokit/rest", () => {
      return {
        Octokit: mock(function() {
          return {
            users: {
              getAuthenticated: mock(() => Promise.reject(new Error("Bad credentials")))
            }
          };
        })
      };
    });

    const request = new Request("http://localhost/api/github/test-connection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token: "invalid-token"
      })
    });

    const response = await POST({ request } as any);

    expect(response.status).toBe(500);

    const data = await response.json();
    // The createSecureErrorResponse function returns an error field, not success
    // It sanitizes error messages for security, so we expect the generic message
    expect(data.error).toBeDefined();
    expect(data.error).toBe("An internal server error occurred");
  });
});

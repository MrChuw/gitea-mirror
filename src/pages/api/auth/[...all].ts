import { auth } from "@/lib/auth";
import type { APIRoute } from "astro";

export const ALL: APIRoute = async (ctx) => {
  // If you want to use rate limiting, make sure to set the 'x-forwarded-for' header
  // to the request headers from the context
  if (ctx.clientAddress) {
    ctx.request.headers.set("x-forwarded-for", ctx.clientAddress);
  }
  
  try {
    return await auth.handler(ctx.request);
  } catch (error) {
    console.error("Auth handler error:", error);
    
    // Check if this is an SSO callback error
    const url = new URL(ctx.request.url);
    if (url.pathname.includes('/sso/callback')) {
      // Redirect to error page for SSO errors
      return Response.redirect(
        `${ctx.url.origin}/auth-error?error=sso_callback_failed&error_description=${encodeURIComponent(
          error instanceof Error ? error.message : "SSO authentication failed"
        )}`,
        302
      );
    }
    
    // Return a proper error response for other errors
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      message: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
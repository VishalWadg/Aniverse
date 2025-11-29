package com.vvw.AniverseBackend.security;

import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserService userDetailsService;
    private final AntPathMatcher pathMatcher;
    private final ApiAuthenticationEntryPoint apiAuthenticationEntryPoint;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        // If the current path starts with any of our public endpoints, return true
        // "true" means "DO NOT RUN THIS FILTER"
        for (String p : SecurityConstants.PUBLIC_URLS) {
            if (pathMatcher.match(p, path)){
                return true;
            }
        }
        return false;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        try{
            log.info("incoming request{}",request.getRequestURI());
            log.info(request.toString());
            String requestTokenHeader = request.getHeader("Authorization");
            if(requestTokenHeader == null || !requestTokenHeader.startsWith("Bearer")){
                filterChain.doFilter(request, response);
                return;
            }
            String token  = requestTokenHeader.split("Bearer ")[1];
            String  username = jwtUtil.getUsernameFromToken(token);
            if(username != null && SecurityContextHolder.getContext().getAuthentication() == null){
                UserDetails user = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
            filterChain.doFilter(request, response);
        }catch(Exception e){
            // Fix 1: Catch Exceptions and delegate to EntryPoint
            log.error("Security Filter Exception: {}",e.getMessage());
            // 2. Catch ANY exception (ExpiredJwt, MalformedJwt, UserNotFound, etc.)
            // and delegate to the EntryPoint to write the 401 JSON.

            // We wrap the original exception in a BadCredentialsException or similar
            // so the EntryPoint receives it as an auth error.
            // This ensures client gets your JSON 401 response, not a Tomcat 500 page
            apiAuthenticationEntryPoint.commence(request, response, new BadCredentialsException("Invalid or Expired Token: " + e.getMessage(), e));
        }
    }
}

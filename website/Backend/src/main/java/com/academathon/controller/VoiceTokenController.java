package com.academathon.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@RestController
@RequestMapping("/api/voice")
public class VoiceTokenController {

    @Value("${livekit.api-key}")
    private String apiKey;

    @Value("${livekit.api-secret}")
    private String apiSecret;

    @Value("${livekit.url}")
    private String livekitUrl;

    @GetMapping("/token")
    public ResponseEntity<Map<String, String>> getToken() {
        String identity = "user-" + UUID.randomUUID();
        String room = "ace-" + UUID.randomUUID();

        Map<String, Object> videoGrants = new HashMap<>();
        videoGrants.put("roomJoin", true);
        videoGrants.put("room", room);
        videoGrants.put("canPublish", true);
        videoGrants.put("canSubscribe", true);

        long now = System.currentTimeMillis();
        String token = Jwts.builder()
                .setIssuer(apiKey)
                .setSubject(identity)
                .setIssuedAt(new Date(now))
                .setNotBefore(new Date(now))
                .setExpiration(new Date(now + 15 * 60 * 1000))
                .claim("video", videoGrants)
                .signWith(
                    Keys.hmacShaKeyFor(apiSecret.getBytes()),
                    SignatureAlgorithm.HS256
                )
                .compact();

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("url", livekitUrl);
        return ResponseEntity.ok(response);
    }
}

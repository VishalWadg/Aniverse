package com.vvw.AniverseBackend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor // JPA entities MUST have a no-arg constructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"posts", "comments"}) // <-- 4. PREVENTS STACKOVERFLOW ERROR
@Table(
        name = "users", // <-- 1. Standard convention (plural)
        indexes = { // <-- 3. ADDED INDEXES for fast searching
                @Index(name = "idx_user_username", columnList = "username", unique = true),
                @Index(name = "idx_user_email", columnList = "email", unique = true)
        }
)
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String name;

    @NotBlank
    @Size(min = 3, max = 30)
    @Column(nullable = false, length = 30, unique = true)
    private String username;

    @NotBlank
    @Email
    @Size(max = 100)
    @Column(nullable = false, unique = true, length = 100) // <-- 2. FIXED LENGTH
    private String email;

    @NotBlank
    @Column(nullable = false, length = 255) // <-- 2. REMOVED unique=true, FIXED LENGTH
    private String password;

    @Column(columnDefinition = "TEXT") // <-- 2. FIXED LENGTH (use TEXT for URLs)
    private String profilePic;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    //  --------------------------------------------------  relationships  --------------------------------------------------

    @OneToMany(
            mappedBy = "author", // <-- 5. Changed 'user' to 'author' (more semantic)
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Post> posts = new ArrayList<>(); // <-- 5. FIXED NAME (plural)

    @OneToMany(
            mappedBy = "author", // <-- 5. Changed 'user' to 'author'
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Comment> comments = new ArrayList<>(); // <-- 5. FIXED TYPO

    //  --------------------------------------------------  Methods  --------------------------------------------------

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }
}
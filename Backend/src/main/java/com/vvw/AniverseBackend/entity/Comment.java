package com.vvw.AniverseBackend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Fetch;
// import org.hibernate.annotations.UpdateTimestamp;


@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@Builder
@ToString(exclude = {"post", "author"}) // You did this perfectly!
@Table(
        name = "comments",
        indexes = { // <-- 2. ADDED INDEXES for fast searching
                @Index(name = "idx_comment_post_id", columnList = "post_id"),
                @Index(name = "idx_comment_author_id", columnList = "author_id")
        }
)
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Boolean isDeleted = false;
    
    //  --------------------------------------------------  relationships  --------------------------------------------------  

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

}

package com.vvw.AniverseBackend.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;


@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@Builder
@ToString(exclude = {"post", "author"}) 
@Table(
        name = "comments",
        indexes = { // <-- 2. ADDED INDEXES for fast searching
                @Index(name = "idx_comment_post_id", columnList = "post_id"),
                @Index(name = "idx_comment_author_id", columnList = "author_id")
        }
)
@SQLRestriction("is_deleted = false")
@SQLDelete(sql = "UPDATE comments SET is_deleted = true WHERE id = ?")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
    
    //  --------------------------------------------------  relationships  --------------------------------------------------  

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE) 
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

}

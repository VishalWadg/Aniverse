package com.vvw.AniverseBackend.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.jsoup.Jsoup;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@SQLDelete(sql = "UPDATE posts SET is_deleted = true, deleted_at = now() WHERE id = ?")
@Table(
        name = "posts",
        indexes = {
                @Index(name = "idx_post_author_id", columnList = "author_id")
        }
)
@ToString(exclude = {"author", "comments"})
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private int wordCount;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    //  --------------------------------------------------  relationships  --------------------------------------------------  

//    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "author_id", nullable = false) 
    private User author;

//    @ToString.Exclude
    @OneToMany(
            mappedBy = "post",
            fetch = FetchType.LAZY,
            cascade = CascadeType.PERSIST
    )
    private List<Comment> comments = new ArrayList<>();



        @PrePersist
        @PreUpdate
        private void calculateWordCount() {
                if (this.content == null || this.content.trim().isEmpty()) {
                        this.wordCount = 0;
                        return;
                }
                String text = Jsoup.parse(this.content).text();
                if (text.trim().isEmpty()) {
                        this.wordCount = 0;
                        return;
                }
                this.wordCount = text.trim().split("\\s+").length;
        }
}

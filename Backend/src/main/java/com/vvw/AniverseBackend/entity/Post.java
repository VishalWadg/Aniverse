package com.vvw.AniverseBackend.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(
        name = "posts",
        indexes = {
                @Index(name = "idx_post_author_id", columnList = "author_id")
        }
)
@ToString(exclude = {"author", "comments"})
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    //  --------------------------------------------------  relationships  --------------------------------------------------  

//    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY) // <-- 5. CRITICAL: Added FetchType.LAZY
    @JoinColumn(name = "author_id", nullable = false) // <-- 5. Added explicit column name
    private User author;

//    @ToString.Exclude
    @OneToMany(
            mappedBy = "post",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL, // <-- 6. Changed to CascadeType.ALL
            orphanRemoval = true
    )
    private List<Comment> comments = new ArrayList<>();
}

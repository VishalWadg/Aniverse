package com.vvw.AniverseBackend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "feedbacks")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "attachments", columnDefinition = "text[]")
    private List<String> attachments;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private FeedbackGroup group;

    @JdbcTypeCode(SqlTypes.VECTOR)
    @Column(name = "embedding")
    private float[] embedding;

    @ManyToMany
    @JoinTable(name = "feedback_tags", joinColumns = @JoinColumn(name = "feedback_id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @org.hibernate.annotations.BatchSize(size = 25)
    private Set<Tag> tags;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}

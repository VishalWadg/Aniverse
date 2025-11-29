# Backend Improvements Documentation
## Aniverse Backend - Comprehensive Improvement Guide

---

## Table of Contents
1. [Critical Fixes](#critical-fixes)
2. [Exception Handling & Error Management](#exception-handling--error-management)
3. [API Enhancements](#api-enhancements)
4. [Security Improvements](#security-improvements)
5. [Data Validation & Input Sanitization](#data-validation--input-sanitization)
6. [Database & Persistence Improvements](#database--persistence-improvements)
7. [Service Layer Enhancements](#service-layer-enhancements)
8. [Testing & Quality Assurance](#testing--quality-assurance)
9. [Documentation & API Standards](#documentation--api-standards)
10. [Performance Optimization](#performance-optimization)
11. [Monitoring & Observability](#monitoring--observability)
12. [Configuration Management](#configuration-management)
13. [Code Quality & Best Practices](#code-quality--best-practices)

---

## Critical Fixes

### 1.1 Fix getUserProfile Implementation
**Priority:** CRITICAL  
**Status:** Currently returns null in UserServiceImpl (line 34)

**Issue:**
The `getUserProfile` method in `UserServiceImpl` currently returns `null`, making the user profile endpoint non-functional.

**Current Code:**
```java
@Override
public UserResponseDto getUserProfile(String username) {
    return null; // BUG: Always returns null
}
```

**Solution:**
```java
@Override
public UserResponseDto getUserProfile(String username) {
    User user = userRepository
        .findByUsername(username)
        .orElseThrow(() -> new UsernameNotFoundException(
            "User with username '" + username + "' not found"));
    return modelMapper.map(user, UserResponseDto.class);
}
```

**Additional Considerations:**
- Add proper exception handling with custom `UserNotFoundException`
- Consider including post count and comment count in the response
- Add optional parameter to include user's recent posts

---

### 1.2 Implement Comment CRUD Operations
**Priority:** HIGH  
**Status:** CommentService only has read operation

**Issue:**
The `CommentService` interface only provides `getCommentsOfPost` method. There's no way to create, update, or delete comments through the API.

**Required Implementation:**

**1.2.1 Create CommentService Methods:**
```java
public interface CommentService {
    Page<CommentResponseDto> getCommentsOfPost(Long postId, Pageable pageable);
    CommentResponseDto createComment(CreateCommentDto createCommentDto, String username, Long postId);
    CommentResponseDto updateComment(Long commentId, UpdateCommentDto updateCommentDto, String username);
    void deleteComment(Long commentId, String username);
    CommentResponseDto getCommentById(Long commentId);
}
```

**1.2.2 Create CommentController:**
```java
@RestController
@RequestMapping("/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;
    
    @GetMapping
    public ResponseEntity<Page<CommentResponseDto>> getComments(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(commentService.getCommentsOfPost(
            postId, PageRequest.of(page, size)));
    }
    
    @PostMapping
    public ResponseEntity<CommentResponseDto> createComment(
            @PathVariable Long postId,
            @RequestBody @Valid CreateCommentDto createCommentDto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(commentService.createComment(createCommentDto, user.getUsername(), postId));
    }
    
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponseDto> updateComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @RequestBody @Valid UpdateCommentDto updateCommentDto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(commentService.updateComment(
            commentId, updateCommentDto, user.getUsername()));
    }
    
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user) {
        commentService.deleteComment(commentId, user.getUsername());
        return ResponseEntity.noContent().build();
    }
}
```

**1.2.3 Create UpdateCommentDto:**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCommentDto {
    @NotBlank(message = "Comment content cannot be blank")
    @Size(min = 1, max = 5000, message = "Comment must be between 1 and 5000 characters")
    private String content;
}
```

**1.2.4 Implement Authorization Checks:**
- Verify user owns the comment before allowing update/delete
- Consider allowing post authors to moderate comments

---

### 1.3 Fix Hardcoded Pagination in PostController
**Priority:** MEDIUM  
**Status:** getAllPosts uses hardcoded PageRequest.of(0, 10)

**Issue:**
The `getAllPosts` endpoint doesn't accept pagination parameters from the client.

**Current Code:**
```java
@GetMapping
public ResponseEntity<Page<PostResponseDto>> getAllPosts() {
    return ResponseEntity.ok().body(postService.getAllPosts(PageRequest.of(0, 10)));
}
```

**Solution:**
```java
@GetMapping
public ResponseEntity<Page<PostResponseDto>> getAllPosts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "DESC") String sortDir) {
    Sort sort = sortDir.equalsIgnoreCase("ASC") 
        ? Sort.by(sortBy).ascending() 
        : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(page, size, sort);
    return ResponseEntity.ok().body(postService.getAllPosts(pageable));
}
```

---

## Exception Handling & Error Management

### 2.1 Implement Global Exception Handler
**Priority:** HIGH  
**Status:** No global exception handling exists

**Issue:**
Currently, exceptions are thrown as `IllegalArgumentException` with inconsistent error messages. There's no standardized error response format.

**Implementation:**

**2.1.1 Create Custom Exception Classes:**
```java
// Base exception
public class AniverseException extends RuntimeException {
    private final String errorCode;
    
    public AniverseException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}

// Specific exceptions
public class ResourceNotFoundException extends AniverseException {
    public ResourceNotFoundException(String resource, Long id) {
        super(String.format("%s with id %d not found", resource, id), 
              "RESOURCE_NOT_FOUND");
    }
    
    public ResourceNotFoundException(String resource, String identifier) {
        super(String.format("%s '%s' not found", resource, identifier), 
              "RESOURCE_NOT_FOUND");
    }
}

public class UnauthorizedException extends AniverseException {
    public UnauthorizedException(String message) {
        super(message, "UNAUTHORIZED");
    }
}

public class ValidationException extends AniverseException {
    private final Map<String, String> fieldErrors;
    
    public ValidationException(String message, Map<String, String> fieldErrors) {
        super(message, "VALIDATION_ERROR");
        this.fieldErrors = fieldErrors;
    }
    
    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}

public class DuplicateResourceException extends AniverseException {
    public DuplicateResourceException(String resource, String identifier) {
        super(String.format("%s '%s' already exists", resource, identifier), 
              "DUPLICATE_RESOURCE");
    }
}
```

**2.1.2 Create Error Response DTO:**
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private String errorCode;
    private String message;
    private Map<String, String> fieldErrors;
    private LocalDateTime timestamp;
    private String path;
}
```

**2.1.3 Create Global Exception Handler:**
```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
            .errorCode(ex.getErrorCode())
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .path(request.getRequestURI())
            .build();
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(
            UnauthorizedException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
            .errorCode(ex.getErrorCode())
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .path(request.getRequestURI())
            .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            ValidationException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
            .errorCode(ex.getErrorCode())
            .message(ex.getMessage())
            .fieldErrors(ex.getFieldErrors())
            .timestamp(LocalDateTime.now())
            .path(request.getRequestURI())
            .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> fieldErrors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                FieldError::getDefaultMessage,
                (existing, replacement) -> existing));
        
        ErrorResponse error = ErrorResponse.builder()
            .errorCode("VALIDATION_ERROR")
            .message("Validation failed")
            .fieldErrors(fieldErrors)
            .timestamp(LocalDateTime.now())
            .path(request.getRequestURI())
            .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
    
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResource(
            DuplicateResourceException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
            .errorCode(ex.getErrorCode())
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .path(request.getRequestURI())
            .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        log.error("Unexpected error occurred", ex);
        ErrorResponse error = ErrorResponse.builder()
            .errorCode("INTERNAL_SERVER_ERROR")
            .message("An unexpected error occurred")
            .timestamp(LocalDateTime.now())
            .path(request.getRequestURI())
            .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

**2.1.4 Update Services to Use Custom Exceptions:**
Replace all `IllegalArgumentException` throws with appropriate custom exceptions.

---

### 2.2 Add Request Validation
**Priority:** HIGH  
**Status:** Controllers don't use @Valid annotation

**Issue:**
DTOs have validation annotations but controllers don't validate them.

**Solution:**
Add `@Valid` annotation to all request body parameters:

```java
@PostMapping
public ResponseEntity<PostResponseDto> createNewPost(
        @RequestBody @Valid CreatePostDto createPostDto,
        @AuthenticationPrincipal User user) {
    // ...
}
```

**Enhance DTOs with Validation:**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostDto {
    @NotBlank(message = "Title cannot be blank")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;
    
    @NotBlank(message = "Content cannot be blank")
    @Size(min = 10, message = "Content must be at least 10 characters")
    private String content;
}
```

---

## API Enhancements

### 3.1 Add Search Functionality
**Priority:** MEDIUM

**Implementation:**

**3.1.1 Add Search Methods to PostRepository:**
```java
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    // Existing methods...
    
    @Query("SELECT p FROM Post p WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Post> searchPosts(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.author.username = :username " +
           "AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Post> searchPostsByAuthor(@Param("username") String username, 
                                    @Param("query") String query, 
                                    Pageable pageable);
}
```

**3.1.2 Add Search Endpoint:**
```java
@GetMapping("/search")
public ResponseEntity<Page<PostResponseDto>> searchPosts(
        @RequestParam String q,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
    Pageable pageable = PageRequest.of(page, size);
    return ResponseEntity.ok(postService.searchPosts(q, pageable));
}
```

**3.1.3 Consider Full-Text Search:**
For better performance with large datasets, consider implementing MySQL FULLTEXT indexes or integrating Elasticsearch.

---

### 3.2 Add Filtering and Sorting
**Priority:** MEDIUM

**Implementation:**

**3.2.1 Add Filter Parameters:**
```java
@GetMapping
public ResponseEntity<Page<PostResponseDto>> getAllPosts(
        @RequestParam(required = false) String author,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "DESC") String sortDir) {
    // Implementation
}
```

**3.2.2 Add Specification Support:**
Use Spring Data JPA Specifications for dynamic queries:

```java
public class PostSpecifications {
    public static Specification<Post> hasAuthor(String username) {
        return (root, query, cb) -> 
            username == null ? null : 
            cb.equal(root.get("author").get("username"), username);
    }
    
    public static Specification<Post> createdBetween(LocalDate from, LocalDate to) {
        return (root, query, cb) -> {
            if (from == null && to == null) return null;
            if (from == null) return cb.lessThanOrEqualTo(root.get("createdAt"), to);
            if (to == null) return cb.greaterThanOrEqualTo(root.get("createdAt"), from);
            return cb.between(root.get("createdAt"), from, to);
        };
    }
}
```

---

### 3.3 Implement User Profile Update
**Priority:** MEDIUM

**Implementation:**

**3.3.1 Create UpdateUserDto:**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserDto {
    @Size(max = 50, message = "Name must not exceed 50 characters")
    private String name;
    
    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;
    
    @URL(message = "Profile picture must be a valid URL")
    private String profilePic;
}
```

**3.3.2 Add Update Method to UserService:**
```java
UserResponseDto updateUserProfile(String username, UpdateUserDto updateUserDto);
```

**3.3.3 Add Update Endpoint:**
```java
@PutMapping("/{username}")
@PreAuthorize("#username == authentication.principal.username")
public ResponseEntity<UserResponseDto> updateUserProfile(
        @PathVariable String username,
        @RequestBody @Valid UpdateUserDto updateUserDto) {
    return ResponseEntity.ok(userService.updateUserProfile(username, updateUserDto));
}
```

---

### 3.4 Add Post Statistics Endpoint
**Priority:** LOW

**Implementation:**
```java
@GetMapping("/{id}/stats")
public ResponseEntity<PostStatsDto> getPostStats(@PathVariable Long id) {
    return ResponseEntity.ok(postService.getPostStats(id));
}

// PostStatsDto
@Data
@Builder
public class PostStatsDto {
    private Long commentCount;
    private Long viewCount; // If you add view tracking
    private Long likeCount; // If you add likes
}
```

---

## Security Improvements

### 4.1 Move Sensitive Configuration to Environment Variables
**Priority:** CRITICAL  
**Status:** Database password and JWT secret are hardcoded

**Issue:**
`application.properties` contains hardcoded sensitive data:
- Database password: `Akadan10`
- JWT secret key

**Solution:**

**4.1.1 Update application.properties:**
```properties
spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:aniverse}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD}

jwt.secretKey=${JWT_SECRET_KEY}
```

**4.1.2 Create application-dev.properties and application-prod.properties:**
```properties
# application-dev.properties
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# application-prod.properties
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
```

**4.1.3 Use Spring Profiles:**
```bash
# Development
java -jar app.jar --spring.profiles.active=dev

# Production
java -jar app.jar --spring.profiles.active=prod
```

**4.1.4 Create .env.example file:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aniverse
DB_USERNAME=root
DB_PASSWORD=your_password_here
JWT_SECRET_KEY=your_secret_key_here
```

---

### 4.2 Enable Secure Cookies in Production
**Priority:** HIGH  
**Status:** Marked as TODO in AuthController

**Issue:**
Refresh token cookies have `secure=false`, making them vulnerable in production.

**Solution:**
```java
@PostMapping("/login")
public ResponseEntity<AuthenticationResponseDto> login(
        @RequestBody LoginRequestDto loginRequestDto) {
    // ...
    boolean isSecure = environment.getProperty("app.cookie.secure", Boolean.class, false);
    ResponseCookie cookie = ResponseCookie.from("refresh_token", refToken)
        .httpOnly(true)
        .secure(isSecure) // Use environment variable
        .path(COOKIE_PATH)
        .maxAge(maxAgeSeconds)
        .sameSite("Strict")
        .build();
    // ...
}
```

---

### 4.3 Add Rate Limiting
**Priority:** MEDIUM

**Implementation:**
Use Spring's rate limiting or Bucket4j:

**4.3.1 Add Bucket4j Dependency:**
```xml
<dependency>
    <groupId>com.bucket4j</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.7.0</version>
</dependency>
```

**4.3.2 Create Rate Limiting Filter:**
```java
@Component
@Slf4j
public class RateLimitingFilter implements Filter {
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, 
                        FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String ip = getClientIpAddress(httpRequest);
        
        Bucket bucket = cache.computeIfAbsent(ip, k -> createNewBucket());
        
        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            httpResponse.getWriter().write("Rate limit exceeded");
        }
    }
    
    private Bucket createNewBucket() {
        return Bucket4j.builder()
            .addLimit(Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1))))
            .build();
    }
}
```

---

### 4.4 Implement Authorization Checks
**Priority:** HIGH

**Issue:**
Post update/delete endpoints don't verify ownership.

**Solution:**

**4.4.1 Add Authorization Check:**
```java
@PutMapping("/{id}")
public ResponseEntity<PostResponseDto> updatePost(
        @PathVariable Long id,
        @RequestBody @Valid UpdatePostDto updatePostDto,
        @AuthenticationPrincipal User user) {
    if (!postService.isUserTheAuthor(user.getUsername(), id)) {
        throw new UnauthorizedException("You are not authorized to update this post");
    }
    return ResponseEntity.ok().body(postService.updatePost(id, updatePostDto));
}
```

**4.4.2 Create Custom Authorization Method:**
```java
@PreAuthorize("@postService.isUserTheAuthor(authentication.principal.username, #id)")
@PutMapping("/{id}")
public ResponseEntity<PostResponseDto> updatePost(...) {
    // ...
}
```

---

### 4.5 Add Password Strength Validation
**Priority:** MEDIUM

**Implementation:**
```java
@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
         message = "Password must be at least 8 characters and contain uppercase, lowercase, number and special character")
private String password;
```

---

## Data Validation & Input Sanitization

### 5.1 Add HTML Content Sanitization
**Priority:** MEDIUM

**Issue:**
Post content uses TinyMCE which can contain HTML. Need to sanitize to prevent XSS attacks.

**Implementation:**
Use OWASP Java HTML Sanitizer:

```xml
<dependency>
    <groupId>com.googlecode.owasp-java-html-sanitizer</groupId>
    <artifactId>owasp-java-html-sanitizer</artifactId>
    <version>20220608.1</version>
</dependency>
```

```java
@Service
public class ContentSanitizer {
    private static final PolicyFactory POLICY = Sanitizers.FORMATTING
        .and(Sanitizers.LINKS)
        .and(Sanitizers.BLOCKS);
    
    public String sanitize(String html) {
        return POLICY.sanitize(html);
    }
}
```

---

### 5.2 Add Input Length Limits
**Priority:** MEDIUM

**Implementation:**
Add database column length constraints and validation:

```java
@Column(nullable = false, length = 255)
@Size(max = 255)
private String title;

@Column(columnDefinition = "TEXT", nullable = false)
@Size(max = 50000) // Limit to 50KB
private String content;
```

---

## Database & Persistence Improvements

### 6.1 Replace ddl-auto=create with Database Migrations
**Priority:** HIGH  
**Status:** Currently using `ddl-auto=create` which drops all data on restart

**Issue:**
Using `ddl-auto=create` is dangerous in production and causes data loss.

**Solution:**
Implement Flyway or Liquibase for database migrations.

**6.1.1 Add Flyway Dependency:**
```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-mysql</artifactId>
</dependency>
```

**6.1.2 Update application.properties:**
```properties
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
```

**6.1.3 Create Migration Files:**
```
src/main/resources/db/migration/
  V1__Initial_schema.sql
  V2__Add_indexes.sql
  V3__Add_comments_table.sql
```

---

### 6.2 Optimize Database Queries
**Priority:** MEDIUM

**6.2.1 Add Query Optimization:**
- Use `@EntityGraph` for eager loading when needed
- Implement batch fetching for collections
- Add database indexes for frequently queried fields

**6.2.2 Add Query Performance Monitoring:**
```properties
spring.jpa.properties.hibernate.generate_statistics=true
spring.jpa.properties.hibernate.format_sql=true
```

---

### 6.3 Implement Soft Delete Properly
**Priority:** MEDIUM

**Issue:**
Posts and Comments have `isDeleted` field but it's not consistently used in queries.

**Solution:**

**6.3.1 Create Base Entity:**
```java
@MappedSuperclass
@Getter
@Setter
public abstract class BaseEntity {
    @Column(nullable = false)
    private Boolean isDeleted = false;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
```

**6.3.2 Add Soft Delete Filter:**
```java
@FilterDef(name = "deletedFilter", parameters = @ParamDef(name = "isDeleted", type = Boolean.class))
@Filter(name = "deletedFilter", condition = "is_deleted = :isDeleted")
public class Post extends BaseEntity {
    // ...
}
```

**6.3.3 Update Repository Queries:**
Always filter by `isDeleted = false` in custom queries.

---

### 6.4 Add Database Connection Pooling Configuration
**Priority:** MEDIUM

**Implementation:**
```properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
```

---

## Service Layer Enhancements

### 7.1 Add Transaction Management
**Priority:** MEDIUM

**Issue:**
Some service methods that should be transactional are not marked as such.

**Solution:**
```java
@Override
@Transactional(readOnly = true)
public PostResponseDto getPostById(Long id) {
    // Read-only transaction
}

@Override
@Transactional
public PostResponseDto createNewPost(CreatePostDto createPostDto, String username) {
    // Write transaction
}
```

---

### 7.2 Implement Service Layer Caching
**Priority:** LOW

**Implementation:**
```java
@Cacheable(value = "posts", key = "#id")
public PostResponseDto getPostById(Long id) {
    // ...
}

@CacheEvict(value = "posts", key = "#id")
public void deletePostById(Long id) {
    // ...
}
```

---

### 7.3 Add Service Layer Logging
**Priority:** MEDIUM

**Implementation:**
```java
@Service
@Slf4j
public class PostServiceImpl implements PostService {
    
    @Override
    public PostResponseDto createNewPost(CreatePostDto createPostDto, String username) {
        log.info("Creating new post by user: {}", username);
        try {
            // Implementation
            log.debug("Post created successfully with id: {}", post.getId());
            return result;
        } catch (Exception e) {
            log.error("Error creating post for user: {}", username, e);
            throw e;
        }
    }
}
```

---

## Testing & Quality Assurance

### 8.1 Add Comprehensive Unit Tests
**Priority:** HIGH

**Implementation:**

**8.1.1 Test Service Layer:**
```java
@ExtendWith(MockitoExtension.class)
class PostServiceImplTest {
    @Mock
    private PostRepository postRepository;
    
    @Mock
    private UserService userService;
    
    @Mock
    private ModelMapper modelMapper;
    
    @InjectMocks
    private PostServiceImpl postService;
    
    @Test
    void createNewPost_ShouldReturnPostResponseDto_WhenValidInput() {
        // Given
        CreatePostDto createPostDto = new CreatePostDto("Title", "Content");
        User user = User.builder().username("testuser").build();
        Post post = Post.builder().id(1L).title("Title").build();
        PostResponseDto expectedDto = new PostResponseDto();
        
        when(userService.findByUsername("testuser")).thenReturn(user);
        when(modelMapper.map(createPostDto, Post.class)).thenReturn(post);
        when(postRepository.save(any(Post.class))).thenReturn(post);
        when(modelMapper.map(post, PostResponseDto.class)).thenReturn(expectedDto);
        
        // When
        PostResponseDto result = postService.createNewPost(createPostDto, "testuser");
        
        // Then
        assertNotNull(result);
        verify(postRepository).save(any(Post.class));
    }
}
```

**8.1.2 Test Controller Layer:**
```java
@WebMvcTest(PostController.class)
class PostControllerTest {
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private PostService postService;
    
    @Test
    void getAllPosts_ShouldReturn200_WhenSuccessful() throws Exception {
        // Test implementation
    }
}
```

---

### 8.2 Add Integration Tests
**Priority:** MEDIUM

**Implementation:**
```java
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class PostIntegrationTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private PostRepository postRepository;
    
    @Test
    void createPost_ShouldPersistToDatabase() throws Exception {
        // Test with actual database
    }
}
```

---

### 8.3 Add Test Coverage Configuration
**Priority:** LOW

**Implementation:**
Add JaCoCo for code coverage:

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.8</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

---

## Documentation & API Standards

### 9.1 Add Swagger/OpenAPI Documentation
**Priority:** HIGH

**Implementation:**

**9.1.1 Add SpringDoc OpenAPI Dependency:**
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.2.0</version>
</dependency>
```

**9.1.2 Create OpenAPI Configuration:**
```java
@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI aniverseOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Aniverse API")
                .description("API documentation for Aniverse - Anime/Manga Community Platform")
                .version("v1.0")
                .contact(new Contact()
                    .name("Aniverse Team")
                    .email("support@aniverse.com")))
            .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
            .components(new Components()
                .addSecuritySchemes("Bearer Authentication", 
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
    }
}
```

**9.1.3 Add API Annotations:**
```java
@Operation(summary = "Get all posts", description = "Retrieve a paginated list of all posts")
@ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Successfully retrieved posts"),
    @ApiResponse(responseCode = "401", description = "Unauthorized")
})
@GetMapping
public ResponseEntity<Page<PostResponseDto>> getAllPosts(...) {
    // ...
}
```

---

### 9.2 Add API Versioning
**Priority:** LOW

**Implementation:**
```java
@RestController
@RequestMapping("/api/v1/posts")
public class PostController {
    // ...
}

// Future version
@RestController
@RequestMapping("/api/v2/posts")
public class PostControllerV2 {
    // ...
}
```

---

### 9.3 Standardize Response Formats
**Priority:** MEDIUM

**Implementation:**
Create a standard response wrapper:

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
            .success(true)
            .data(data)
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
            .success(true)
            .message(message)
            .data(data)
            .timestamp(LocalDateTime.now())
            .build();
    }
}
```

---

## Performance Optimization

### 10.1 Implement Caching Strategy
**Priority:** MEDIUM

**Implementation:**

**10.1.1 Add Cache Dependencies:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>
```

**10.1.2 Configure Caching:**
```java
@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public CaffeineCacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("posts", "users");
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(10, TimeUnit.MINUTES));
        return cacheManager;
    }
}
```

---

### 10.2 Optimize N+1 Query Problems
**Priority:** HIGH

**Issue:**
Lazy loading can cause N+1 query problems.

**Solution:**
Use `@EntityGraph` or `JOIN FETCH` in queries:

```java
@EntityGraph(attributePaths = {"author", "comments"})
@Query("SELECT p FROM Post p WHERE p.id = :id")
Optional<Post> findByIdWithAuthor(@Param("id") Long id);
```

---

### 10.3 Add Database Query Optimization
**Priority:** MEDIUM

**Implementation:**
- Add indexes for frequently queried columns
- Use `@BatchSize` for collection fetching
- Implement pagination for all list endpoints

---

### 10.4 Implement Async Processing
**Priority:** LOW

**Implementation:**
For long-running operations:

```java
@Async
public CompletableFuture<Void> sendNotificationEmail(User user) {
    // Async email sending
    return CompletableFuture.completedFuture(null);
}
```

---

## Monitoring & Observability

### 11.1 Add Actuator Endpoints
**Priority:** MEDIUM

**Implementation:**

**11.1.1 Add Dependency:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**11.1.2 Configure Endpoints:**
```properties
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.endpoint.health.show-details=when-authorized
```

---

### 11.2 Add Structured Logging
**Priority:** MEDIUM

**Implementation:**
Use Logback with JSON format:

```xml
<!-- logback-spring.xml -->
<configuration>
    <appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LoggingEventCompositeJsonEncoder">
            <providers>
                <timestamp/>
                <version/>
                <logLevel/>
                <message/>
                <mdc/>
                <stackTrace/>
            </providers>
        </encoder>
    </appender>
    <root level="INFO">
        <appender-ref ref="JSON" />
    </root>
</configuration>
```

---

### 11.3 Add Application Metrics
**Priority:** LOW

**Implementation:**
```java
@Component
public class CustomMetrics {
    private final Counter postCreationCounter;
    private final Timer requestTimer;
    
    public CustomMetrics(MeterRegistry registry) {
        this.postCreationCounter = Counter.builder("posts.created")
            .description("Number of posts created")
            .register(registry);
        this.requestTimer = Timer.builder("http.request.duration")
            .register(registry);
    }
}
```

---

## Configuration Management

### 12.1 Externalize All Configuration
**Priority:** HIGH

**Implementation:**
- Move all configuration to `application.properties` or environment variables
- Use `@ConfigurationProperties` for type-safe configuration:

```java
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {
    private Security security = new Security();
    private Cors cors = new Cors();
    
    @Data
    public static class Security {
        private Jwt jwt = new Jwt();
        
        @Data
        public static class Jwt {
            private long expirationMs = 900000;
            private RefreshToken refreshToken = new RefreshToken();
            
            @Data
            public static class RefreshToken {
                private long expirationMs = 604800000;
                private long absoluteExpirationMs = 2592000000;
            }
        }
    }
    
    @Data
    public static class Cors {
        private List<String> allowedOrigins = new ArrayList<>();
    }
}
```

---

### 12.2 Add Configuration Validation
**Priority:** MEDIUM

**Implementation:**
```java
@ConfigurationProperties(prefix = "app")
@Validated
public class AppProperties {
    @NotNull
    @Valid
    private Security security;
}
```

---

## Code Quality & Best Practices

### 13.1 Add Code Formatting Standards
**Priority:** LOW

**Implementation:**
- Use Google Java Format or Checkstyle
- Configure IDE to format on save
- Add pre-commit hooks

---

### 13.2 Improve Error Messages
**Priority:** MEDIUM

**Issue:**
Error messages are inconsistent and sometimes not user-friendly.

**Solution:**
Create a message properties file:

```properties
# messages.properties
error.user.not.found=User with username '{0}' not found
error.post.not.found=Post with id {0} not found
error.unauthorized=You are not authorized to perform this action
```

```java
@Autowired
private MessageSource messageSource;

public String getMessage(String code, Object... args) {
    return messageSource.getMessage(code, args, LocaleContextHolder.getLocale());
}
```

---

### 13.3 Add Null Safety
**Priority:** MEDIUM

**Implementation:**
- Use `@NonNull` annotations from Lombok
- Add null checks where necessary
- Consider using Optional for return types

---

### 13.4 Refactor Service Methods
**Priority:** LOW

**Issues:**
- `updatePostPartially` uses switch statement - consider using reflection or MapStruct
- Some methods are too long - break into smaller methods

---

## Additional Feature Implementations

### 14.1 Implement Like/Dislike System
**Priority:** MEDIUM

**Implementation:**
Create Like entity and endpoints:

```java
@Entity
@Table(name = "likes")
public class Like {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

---

### 14.2 Implement Notification System
**Priority:** LOW

**Implementation:**
The `NotificationType` enum exists but no implementation. Create Notification entity and service.

---

### 14.3 Add Post Tags/Categories
**Priority:** LOW

**Implementation:**
The `PostTagId` entity exists. Implement tag system for posts.

---

## Summary & Priority Matrix

### Critical (Do First):
1. Fix getUserProfile implementation
2. Move sensitive data to environment variables
3. Implement Comment CRUD operations
4. Add global exception handler
5. Replace ddl-auto=create with migrations

### High Priority:
6. Add request validation with @Valid
7. Implement authorization checks
8. Add comprehensive unit tests
9. Add Swagger/OpenAPI documentation
10. Optimize N+1 query problems

### Medium Priority:
11. Add search functionality
12. Add filtering and sorting
13. Implement user profile update
14. Add rate limiting
15. Add HTML content sanitization
16. Implement soft delete properly
17. Add service layer logging
18. Add caching strategy

### Low Priority:
19. Add integration tests
20. Add API versioning
21. Implement like/dislike system
22. Add notification system
23. Add post tags/categories

---

## Implementation Timeline Recommendation

**Week 1-2: Critical Fixes**
- Fix getUserProfile
- Implement Comment CRUD
- Add global exception handler
- Move to environment variables
- Set up database migrations

**Week 3-4: High Priority**
- Add validation
- Implement authorization
- Add unit tests
- Set up Swagger
- Optimize queries

**Week 5-6: Medium Priority**
- Add search and filtering
- Implement user profile update
- Add rate limiting
- Implement caching
- Add logging

**Week 7+: Low Priority**
- Additional features
- Performance optimizations
- Advanced monitoring

---

*This document should be updated as improvements are implemented.*


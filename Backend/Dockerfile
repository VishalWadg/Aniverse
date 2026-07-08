# Stage 1: Build Java Application
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
# Cache maven dependencies
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Run JRE (Non-Root)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080

# Ensure Tomcat has a writable temp directory
VOLUME /tmp

# Run container as a non-privileged system user
USER nobody

# Allow dynamic JVM memory allocation via environment variables
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
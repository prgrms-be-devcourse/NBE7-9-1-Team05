plugins {
    java
    id("org.springframework.boot") version "3.5.6"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "demo"
version = "0.0.1-SNAPSHOT"
description = "cafe-menu"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

configurations {
    compileOnly {
        extendsFrom(configurations.annotationProcessor.get())
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // --- Spring starters (REST + JPA + Validation) ---
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")

    /*// --- Security / JWT ---
    implementation("org.springframework.boot:spring-boot-starter-security")
    // JWT 검증(리소스 서버). Nimbus 기반, Boot가 버전 관리
    implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")
    // JWT 발급에 편한 JJWT (버전 지정 필요)
    implementation("io.jsonwebtoken:jjwt-api:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")*/

    // --- OpenAPI(Swagger UI) ---
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0")

    // --- Dev / DB ---
    developmentOnly("org.springframework.boot:spring-boot-devtools")
    runtimeOnly("com.h2database:h2")

    // --- Lombok ---
    compileOnly("org.projectlombok:lombok")
    annotationProcessor("org.projectlombok:lombok")

    // --- Test ---
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
    useJUnitPlatform()
}

# 빌드 스테이지
FROM gradle:7.6.1-jdk17 AS build
WORKDIR /home/gradle/src
COPY --chown=gradle:gradle . .
RUN gradle build --no-daemon

# 실행 스테이지
FROM openjdk:17-slim

# 애플리케이션 저장 디렉토리 생성
WORKDIR /app

# 빌드 스테이지에서 생성된 JAR 파일을 복사
COPY --from=build /home/gradle/src/build/libs/your-app.jar app.jar

# 애플리케이션 프로파일 설정 (옵션)
ENV SPRING_PROFILES_ACTIVE=production

# 컨테이너 실행 시 실행될 명령어
ENTRYPOINT ["java", "-jar", "app.jar"]

# 컨테이너가 리스닝할 포트
EXPOSE 8081
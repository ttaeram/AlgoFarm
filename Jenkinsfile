pipeline {
    agent any
    stages {
        stage('Cleanup Workspace') {
            steps {
                cleanWs()
            }
        }
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build Backend') {
            steps {
                dir('back') {
                    sh 'chmod +x ./gradlew'
                    sh './gradlew clean build'
                }
            }
        }
        stage('Build and Deploy Backend') {
            steps {
                script {
                    dir('back') {
                        // 도커 이미지 빌드
                	sh 'docker build -t jenkins-test .'
                
                	// 기존 컨테이너 중지 및 제거
                	sh 'docker stop jenkins-test || true'
                	sh 'docker rm jenkins-test || true'
                
                	// 새 컨테이너 실행
                	sh 'docker run -d --name jenkins-test -p 8081:8081 jenkins-test'
                    }
                }
            }
        }
        stage('Verify Backend') {
            steps {
                script {
                    // 컨테이너가 실행 중인지 확인
                    def isRunning = sh(script: "docker ps -q -f name=my-spring-app", returnStatus: true) == 0
                    if (isRunning) {
                        echo "Backend application is running successfully."
                    } else {
                        error "Backend application failed to start."
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('front') {
                    // 프론트엔드 빌드 명령어를 여기에 추가하세요
                    // 예: npm install && npm run build
                    echo "Frontend build step - replace with actual build commands"
                }
            }
        }

        stage('Deploy Frontend') {
            steps {
                dir('front') {
                    // 프론트엔드 배포 명령어를 여기에 추가하세요
                    // 예: rsync 또는 cp 명령어를 사용하여 빌드된 파일을 웹 서버 디렉토리로 복사
                    echo "Frontend deploy step - replace with actual deploy commands"
                }
            }
        }

        stage('Record Version') {
            steps {
                script {
                    def commitHash = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    def version = "${BUILD_NUMBER}-${commitHash}"
                    sh "echo 'Deployed version: ${version}' > version.txt"
                    archiveArtifacts artifacts: 'version.txt', fingerprint: true
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished'
	    cleanWs()
        }
        success {
            echo 'Successfully deployed'
        }
        failure {
            echo 'Deployment failed'
        }
    }
}

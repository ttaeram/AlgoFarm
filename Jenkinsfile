pipeline {
    agent any

    stages {
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

        stage('Deploy Backend') {
            steps {
                script {
                    dir('back') {
                        def jarFile = sh(script: "ls build/libs | grep 'SNAPSHOT.jar' | head -n 1", returnStdout: true).trim()
                        def runningPid = sh(script: "pgrep -f $jarFile || echo ''", returnStdout: true).trim()

                        if (runningPid) {
                            sh "kill $runningPid"
                            sleep 5 // 프로세스가 완전히 종료되기를 기다립니다
                        }

                        sh "nohup java -jar build/libs/$jarFile > ../nohup.out 2>&1 &"
                    }
                }
            }
        }

        stage('Verify Backend') {
            steps {
                script {
                    dir('back') {
                        def jarFile = sh(script: "ls build/libs | grep 'SNAPSHOT.jar' | head -n 1", returnStdout: true).trim()
                        def isRunning = sh(script: "pgrep -f $jarFile", returnStatus: true) == 0

                        if (isRunning) {
                            echo "Backend application is running successfully."
                        } else {
                            error "Backend application failed to start."
                        }
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
        }
        success {
            echo 'Successfully deployed'
        }
        failure {
            echo 'Deployment failed'
        }
    }
}
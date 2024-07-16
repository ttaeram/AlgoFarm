pipeline {
    agent any
    stages {
        stage('Cleanup Workspace') {
            steps {
                cleanWs()
            }
        }
        stage('Git Setup') {
            steps {
                sh 'git config --global --add safe.directory /var/jenkins_home/workspace/SpringBootPipe'
                sh 'chown -R jenkins:jenkins .'
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
                        sh 'docker build -t jenkins-test .'
                        sh 'docker stop jenkins-test || true'
                        sh 'docker rm jenkins-test || true'
                        sh 'docker run -d --name jenkins-test -p 8081:8081 jenkins-test'
                    }
                }
            }
        }
        stage('Verify Backend') {
            steps {
                script {
                    def isRunning = sh(script: "docker ps -q -f name=jenkins-test", returnStatus: true) == 0
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
                    echo "Frontend build step - replace with actual build commands"
                }
            }
        }
        stage('Deploy Frontend') {
            steps {
                dir('front') {
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
            script {
                echo 'Pipeline finished'
                cleanWs()
            }
        }
        success {
            echo 'Successfully deployed'
        }
        failure {
            echo 'Deployment failed'
        }
    }
}

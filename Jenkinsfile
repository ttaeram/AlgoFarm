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
        stage('Build and Deploy Backend') {
            steps {
                dir('back') {
                    sh 'docker build -t jenkins-test .'
                    sh 'docker stop jenkins-test || true'
                    sh 'docker rm jenkins-test || true'
                    sh 'docker run -d --name jenkins-test -p 8081:8081 jenkins-test'
                }
            }
        }
        stage('Verify Backend') {
            steps {
                script {
                    def isRunning = sh(script: "docker ps -q -f name=jenkins-test", returnStatus: true) == 0
                    if (!isRunning) {
                        error "Backend application failed to start."
                    }
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

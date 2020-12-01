build:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v2

            -   name: Build and push docker image
                uses: docker/build-push-action@v1
                with:
                    username: ${{ secrets.DOCKER_USERNAME }}
                    password: ${{ secrets.DOCKER_PASSWORD }}
                    dockerfile: Dockerfile
                    repository: my/repository
                    tag_with_ref: true
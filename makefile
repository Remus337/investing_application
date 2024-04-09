build-down:  
	docker-compose down --rmi all --volumes --remove-orphans

build-up:
	docker-compose up -d --build --remove-orphans
up:
	docker-compose up -d --remove-orphans
down:
	docker-compose down
build:
	docker-compose build
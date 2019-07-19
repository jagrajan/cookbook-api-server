create:
	mkdir images
	mkdir logs
	cp images-default/* images
	yarn install
	yarn run init

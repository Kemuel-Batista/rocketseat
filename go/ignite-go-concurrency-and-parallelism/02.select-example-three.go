package main

import (
	"log"
	"time"
)

func main() {
	stopper := time.After(10 * time.Second)
	ticker := time.NewTicker(250 * time.Millisecond).C

	log.Println("Start")
	defer log.Println("finish")

	for {
		select {
		case <-ticker:
			log.Println("Updating...")
		case <-stopper:
			log.Println("Stopping process")
			return
		}
	}
}

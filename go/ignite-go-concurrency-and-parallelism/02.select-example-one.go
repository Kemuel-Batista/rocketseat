package main

import (
	"fmt"
	"time"
)

func main1() {
	chans := []chan int{
		make(chan int),
		make(chan int),
	}

	for i, ch := range chans {
		go func(i int, ch chan<- int) {
			for {
				time.Sleep(time.Duration(i+2) * time.Second) // 2, 3 seconds
				ch <- i + 1                                  // 1, 2
			}
		}(i, ch)
	}

	for i := 0; i < 20; i++ {
		// v1 := <-chans[0] // Blocking
		// fmt.Println("Got a value on channel 1", v1)
		// v2 := <-chans[1]
		// fmt.Println("Got a value on channel 2", v2)
		select {
		case v1 := <-chans[0]:
			fmt.Println("Got a value on channel 1", v1)
		case v2 := <-chans[1]:
			fmt.Println("Got a value on channel 2", v2)
		}
	}
}

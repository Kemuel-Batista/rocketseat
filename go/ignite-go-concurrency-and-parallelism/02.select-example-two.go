package main

import (
	"fmt"
	"runtime"
	"time"
)

func takesTooLong(ch chan<- int) {
	time.Sleep(10 * time.Second)
	ch <- 20
}

func takesNotSoLong(ch chan<- int) {
	time.Sleep(2 * time.Second)
	ch <- 999
}

func main2() {
	stop := time.After(5 * time.Second)
	ch1 := make(chan int)
	ch2 := make(chan int)

	go takesTooLong(ch1) // hanging...
	go takesNotSoLong(ch2)
	defer fmt.Println("Number of goroutines:", runtime.NumGoroutine())

	select {
	case <-ch1:
		println("Too long finished")
	case <-ch2:
		println("Not so long finished")
	case <-stop:
		println("This operation took too long, aborting")
		return
	}
}

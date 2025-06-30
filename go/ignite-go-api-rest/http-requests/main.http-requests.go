package httprequests

import (
	"fmt"
	"io"
	"net/http"
)

func mainHttpRequests() {
	resp, err := http.Get("https://www.google.com")

	if err != nil {
		panic(err)
	}

	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)

	if err != nil {
		panic(err)
	}

	fmt.Println(string(data))
}

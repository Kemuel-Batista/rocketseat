package httprequests

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"time"
)

func main() {
	req, err := http.NewRequest(http.MethodGet, "https://www.googleapis.com/", nil)

	if err != nil {
		panic(err)
	}

	// Ao usar set o valor é sobrescrito
	req.Header.Set("authorization", "123")
	// Logo, o valor de authorization é "456"
	req.Header.Set("authorization", "456")

	// Ao usar o add, ele adiciona mais um valor ao header existente
	req.Header.Add("authorization", "123")

	// Dizendo pro servidor que mande em JSON (não obrigatório retornar em JSON)
	req.Header.Set("accept", "application/json")

	resp, err := http.DefaultClient.Do(req)

	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}

	fmt.Println(string(data))

	// Usando requisições com contexto
	// Requests podem gerar timeouts, para evitar com que requisições fiquem presas por vários minutos, horas
	ctx := context.Background()
	// Usa-se cancel para setar o tempo de timeout da requisição
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	reqCtx, errCtx := http.NewRequestWithContext(
		ctx,
		http.MethodGet,
		"https://www.googleapis.com/",
		nil,
	)

	if errCtx != nil {
		panic(errCtx)
	}

	respCtx, errCtx := http.DefaultClient.Do(reqCtx)

	if errCtx != nil {
		panic(errCtx)
	}
	defer respCtx.Body.Close()

	dataCtx, errCtx := io.ReadAll(respCtx.Body)
	if errCtx != nil {
		panic(errCtx)
	}

	fmt.Println(string(dataCtx))
}

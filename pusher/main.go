package main

import (
	"fmt"
	"log"
	"os"
	"time"

	nats "github.com/nats-io/go-nats"
	"github.com/satori/go.uuid"
)

type content struct {
	Id         int    `json:"id"`
	ContentUid string `json:"content_uid"`
}

func sendContent(ec *nats.EncodedConn, c *content, sub string) {

	if err := ec.Publish(sub, c); err != nil {
		log.Printf("failed to publish message id:%d content_uid:%s", c.Id, c.ContentUid)
	} else {
		log.Printf("publishing message id:%d content_uid:%s", c.Id, c.ContentUid)
	}

	if err := ec.Flush(); err != nil {
		log.Printf("failed to flush id:%d", c.Id)
	}

}

func run(addr, sub string) error {
	var i int

	nc, err := nats.Connect(addr)

	if err != nil {
		return err
	}

	ec, err := nats.NewEncodedConn(nc, "json")

	if err != nil {
		return err
	}

	defer ec.Close()

	log.Printf("sucesfully connected to %s", addr)

	for {
		go sendContent(ec, &content{
			Id:         i,
			ContentUid: uuid.NewV4().String(),
		}, sub)
		i++
		time.Sleep(3 * time.Second)
	}

	return nil
}

func main() {
	var (
		addr = "127.0.0.1"
		port = "4222"
		sub  = "content"
	)

	if env := os.Getenv("NATS_HOST"); env != "" {
		addr = env
	}
	if env := os.Getenv("NATS_PORT"); env != "" {
		port = env
	}
	if env := os.Getenv("NATS_SUB"); env != "" {
		sub = env
	}

	log.Fatal(run(fmt.Sprintf("nats://%s:%s", addr, port), sub))
}

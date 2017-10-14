package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()
	router.Static("/js", "./js")
	router.Static("/css", "./css")
	router.Static("/image", "./image")
	router.Static("/assets", "./assets")
	router.Run(":8091")
}

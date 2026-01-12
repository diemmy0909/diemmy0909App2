package com.trannam.example05.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.*;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI springShopOpenAPI() {
        return new OpenAPI()
            .info(new Info().title("E-Commerce Application")
            .description("Backend APIs for E-Commerce app")
            .version("v1.0.0")
            .contact(new Contact().name("Tran Nam").url("trannam@hitu.edu.vn").email("trannam@hitu.edu.vn"))
            .license(new License().name("License").url("/")))
            .externalDocs(new ExternalDocumentation().description("E-Commerce App Documentation")
            .url("http://localhost:8080/swagger-ui/index.html"));
    }
}
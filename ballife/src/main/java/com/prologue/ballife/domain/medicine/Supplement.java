package com.prologue.ballife.domain.medicine;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name= "SUPPLEMENT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Supplement_ID")
    private Long supplementId;

    @Column(name = "Supplement_Name", length = 50)
    private String supplementName;

    @Column(name = "Manufacturer", length = 50)
    private String manufacturer;

    @Column(name = "Ingredient_Text", length = 300)
    private String ingredientText;

    @Column(name = "Usage_Text", length = 300)
    private String usageText;

    @Column(name = "Side_Effect_Text", length = 300)
    private String sideEffectText;

    @Column(name = "Image_Url", length = 50)
    private String imageUrl;

    
}

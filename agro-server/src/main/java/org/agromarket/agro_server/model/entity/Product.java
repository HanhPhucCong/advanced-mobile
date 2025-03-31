package org.agromarket.agro_server.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.agromarket.agro_server.common.Unit;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Product extends BaseEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String description;

  @Column(nullable = false)
  private Double price = 0.0;

  @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<ProductImage> images = new ArrayList<>();

  @Column(nullable = false)
  private long quantity;

  @Column(nullable = false)
  private Long purchaseCount = 0L;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Unit unit;

  @ManyToOne
  @JoinColumn(name = "category_id", nullable = false)
  @JsonIgnore
  private Category category;

  @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Review> reviews = new ArrayList<>();

  @ManyToMany(mappedBy = "products")
  private List<Favorite> favorites = new ArrayList<>();

  public void addImage(ProductImage image) {
    images.add(image);
    image.setProduct(this);
  }

  public void clearImages() {
    for (ProductImage image : images) {
      image.setProduct(null);
    }
    images.clear();
  }
}

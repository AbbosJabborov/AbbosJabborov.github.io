from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Game(models.Model):
    title = models.CharField(max_length=50)
    cover = models.ImageField(
        upload_to="images/movie-cover/%Y/%m/%d/", null=True, blank=True
    )


class Project(models.Model):
    title = models.CharField(max_length=50)
    cover = models.ImageField(
        upload_to="images/movie-cover/%Y/%m/%d/", null=True, blank=True
    )
    is_opensource = models.BooleanField(default=False)
    embed_html = models.TextField(blank=True, null=True)


class Review(models.Model):
    title = models.CharField(max_length=50)
    desc = models.CharField(max_length=300)
    rating = models.PositiveIntegerField(
        default=0, validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    review_date = models.DateField(auto_now=True)
    game_id = models.ForeignKey(Game, on_delete=models.CASCADE)


class Post(models.Model):
    title = models.CharField(max_length=100)
    body = models.CharField(max_length=10000)
    post_date = models.DateField(auto_now=True)


# Enum example commendted out for future, maybe for tags?
# class Topic(models.Model):
#     FRESHMAN = "FR"
#     SOPHOMORE = "SO"
#     JUNIOR = "JR"
#     SENIOR = "SR"
#     GRADUATE = "GR"
#     YEAR_IN_SCHOOL_CHOICES = {
#         FRESHMAN: "Freshman",
#         SOPHOMORE: "Sophomore",
#         JUNIOR: "Junior",
#         SENIOR: "Senior",
#         GRADUATE: "Graduate",
#     }
#     year_in_school = models.CharField(
#         max_length=2,
#         choices=YEAR_IN_SCHOOL_CHOICES,
#         default=FRESHMAN,
#     )

#     def is_upperclass(self):
#         return self.year_in_school in {self.JUNIOR, self.SENIOR}

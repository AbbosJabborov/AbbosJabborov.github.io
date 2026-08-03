from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Game(models.Model):
    title = models.CharField(max_length=100)
    slug = models.SlugField(blank=True, null=True, unique=True)
    platform = models.CharField(max_length=20, default="STEAM")


    steam_appid = models.IntegerField(null=True, blank=True, help_text="Steam App ID for automated Steam assets")
    cover = models.ImageField(
        upload_to="images/movie-cover/%Y/%m/%d/", null=True, blank=True
    )
    cover_url = models.URLField(max_length=500, blank=True, null=True)
    hero_url = models.URLField(max_length=500, blank=True, null=True)
    icon_url = models.URLField(max_length=500, blank=True, null=True)
    store_url = models.URLField(max_length=500, blank=True, null=True, help_text="Link to game store page")
    
    is_favorite = models.BooleanField(default=False)
    category = models.CharField(max_length=50, default="FAVORITES")
    playtime_hours = models.FloatField(default=0.0)
    last_played = models.CharField(max_length=50, default="Yesterday")
    
    review_headline = models.CharField(max_length=250, blank=True, null=True)
    review_content = models.TextField(
        blank=True, null=True, help_text="Telegra.ph style markdown/HTML review text with images & GIFs"
    )
    rating = models.PositiveIntegerField(
        default=9, validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Game.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        
        # Auto fill Steam CDN URLs and store URL if steam_appid is provided
        if self.steam_appid:
            if not self.cover_url:
                self.cover_url = f"https://cdn.akamai.steamstatic.com/steam/apps/{self.steam_appid}/library_600x900_2x.jpg"
            if not self.hero_url:
                self.hero_url = f"https://cdn.akamai.steamstatic.com/steam/apps/{self.steam_appid}/library_hero.jpg"
            if not self.icon_url:
                self.icon_url = f"https://cdn.akamai.steamstatic.com/steam/apps/{self.steam_appid}/header.jpg"
            if not self.store_url:
                self.store_url = f"https://store.steampowered.com/app/{self.steam_appid}/"

        super().save(*args, **kwargs)


    def __str__(self):
        return self.title



class Project(models.Model):
    slug = models.SlugField(blank=True, unique=True)
    title = models.CharField(max_length=50)
    desc = models.TextField(max_length=300, blank=True)
    cover = models.ImageField(
        upload_to="images/project-cover/%Y/%m/%d/", null=True, blank=True
    )
    is_opensource = models.BooleanField(default=False)
    embed_html = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Project.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


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


class Note(models.Model):
    message = models.TextField(max_length=500)
    sender = models.CharField(max_length=50, blank=True, null=True)
    position_x = models.FloatField()
    position_y = models.FloatField()
    color = models.CharField(max_length=7, default="#c9cfcf")
    created_at = models.DateTimeField(default=timezone.now)

    # Admin response
    admin_reply = models.TextField(max_length=500, blank=True, null=True)
    replied_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Note by {self.sender or 'Anonymous'} at {self.created_at}"

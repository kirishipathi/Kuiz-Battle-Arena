import pygame
import sys
import random
import math

# Initialize Pygame
pygame.init()

# Screen settings
WIDTH, HEIGHT = 1000, 700
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption('Environmental Heroes - Mini Quests')

# Colors
WHITE = (255, 255, 255)
DEEP_BLUE = (0, 100, 150)
LIGHT_BLUE = (135, 206, 235)
GREEN = (34, 139, 34)
DARK_GREEN = (0, 100, 0)
RED = (220, 20, 60)
ORANGE = (255, 140, 0)
YELLOW = (255, 215, 0)
BLACK = (0, 0, 0)
GRAY = (128, 128, 128)
PURPLE = (128, 0, 128)

# Fonts
font_title = pygame.font.Font(None, 48)
font_large = pygame.font.Font(None, 36)
font_medium = pygame.font.Font(None, 28)
font_small = pygame.font.Font(None, 20)

# Game states
MENU = 'menu'
QUEST1 = 'quest1'  # Water shortage
QUEST2 = 'quest2'  # Plastic waste
QUEST3 = 'quest3'  # Green energy
WIN = 'win'
INSTRUCTIONS = 'instructions'

class Game:
    def __init__(self):
        self.state = MENU
        self.selected_quest = None
        self.reset_all_quests()
        
    def reset_all_quests(self):
        # Player settings
        self.player_size = 50
        self.player_pos = [WIDTH // 2, HEIGHT - self.player_size - 20]
        self.player_speed = 8
        
        # Quest 1: Water Shortage
        self.water_drops = []
        self.water_drop_size = 25
        self.water_drop_speed = 4
        self.water_caught = 0
        self.water_target = 15
        self.spawn_water_drops()
        
        # Quest 2: Plastic Waste
        self.plastic_items = []
        self.plastic_size = 35
        self.plastic_speed = 5
        self.plastic_collected = 0
        self.plastic_target = 12
        self.spawn_plastic_items()
        
        # Quest 3: Green Energy
        self.factories = []
        self.factory_size = 80
        self.factories_converted = 0
        self.factories_target = 8
        self.conversion_radius = 60
        self.spawn_factories()
        
        # Visual effects
        self.particles = []
        
    def spawn_water_drops(self):
        self.water_drops = []
        for _ in range(8):
            x = random.randint(50, WIDTH - 50)
            y = random.randint(-200, -50)
            self.water_drops.append([x, y])
    
    def spawn_plastic_items(self):
        self.plastic_items = []
        for _ in range(6):
            x = random.randint(50, WIDTH - 50)
            y = random.randint(-300, -50)
            self.plastic_items.append([x, y])
    
    def spawn_factories(self):
        self.factories = []
        for _ in range(self.factories_target):
            x = random.randint(100, WIDTH - 100)
            y = random.randint(100, HEIGHT - 200)
            # [x, y, converted, conversion_progress]
            self.factories.append([x, y, False, 0])

class Renderer:
    @staticmethod
    def draw_gradient_background(surface, color1, color2):
        for y in range(HEIGHT):
            ratio = y / HEIGHT
            r = color1[0] * (1 - ratio) + color2[0] * ratio
            g = color1[1] * (1 - ratio) + color2[1] * ratio
            b = color1[2] * (1 - ratio) + color2[2] * ratio
            pygame.draw.line(surface, (int(r), int(g), int(b)), (0, y), (WIDTH, y))
    
    @staticmethod
    def draw_player(surface, pos, size):
        # Draw player as an eco-hero character
        center_x, center_y = pos[0] + size // 2, pos[1] + size // 2
        
        # Body
        pygame.draw.ellipse(surface, GREEN, (pos[0] + 10, pos[1] + 15, size - 20, size - 15))
        
        # Head
        pygame.draw.circle(surface, (255, 220, 177), (center_x, pos[1] + 15), 12)
        
        # Cape
        cape_points = [(pos[0] + 5, pos[1] + 20), (pos[0] - 5, pos[1] + 40), (pos[0] + 10, pos[1] + 35)]
        pygame.draw.polygon(surface, DEEP_BLUE, cape_points)
    
    @staticmethod
    def draw_water_drop(surface, pos, size):
        # Draw stylized water drop
        center_x, center_y = pos[0], pos[1] + size // 2
        
        # Drop shape
        points = [
            (center_x, pos[1]),
            (center_x - size // 2, center_y),
            (center_x - size // 3, center_y + size // 2),
            (center_x + size // 3, center_y + size // 2),
            (center_x + size // 2, center_y)
        ]
        pygame.draw.polygon(surface, LIGHT_BLUE, points)
        
        # Highlight
        pygame.draw.circle(surface, WHITE, (center_x - 5, center_y - 3), 3)
    
    @staticmethod
    def draw_plastic_item(surface, pos, size):
        # Draw plastic bottle
        bottle_rect = pygame.Rect(pos[0], pos[1] + 5, size - 10, size - 5)
        pygame.draw.rect(surface, RED, bottle_rect)
        
        # Cap
        cap_rect = pygame.Rect(pos[0] + 5, pos[1], size - 20, 8)
        pygame.draw.rect(surface, ORANGE, cap_rect)
        
        # Label
        pygame.draw.rect(surface, WHITE, (pos[0] + 3, pos[1] + 15, size - 16, 8))
    
    @staticmethod
    def draw_factory(surface, pos, size, converted, progress):
        # Factory building
        building_rect = pygame.Rect(pos[0], pos[1], size, size)
        color = DARK_GREEN if converted else GRAY
        pygame.draw.rect(surface, color, building_rect)
        
        # Smokestacks
        stack_color = GREEN if converted else BLACK
        for i in range(3):
            stack_x = pos[0] + 15 + i * 20
            pygame.draw.rect(surface, stack_color, (stack_x, pos[1] - 20, 8, 25))
        
        # Conversion progress indicator
        if not converted and progress > 0:
            progress_rect = pygame.Rect(pos[0], pos[1] - 10, size * (progress / 100), 5)
            pygame.draw.rect(surface, GREEN, progress_rect)
        
        # Solar panels if converted
        if converted:
            for i in range(2):
                for j in range(2):
                    panel_x = pos[0] + 10 + j * 25
                    panel_y = pos[1] + 10 + i * 25
                    pygame.draw.rect(surface, DEEP_BLUE, (panel_x, panel_y, 20, 15))

    @staticmethod
    def draw_text_centered(surface, text, font, color, y):
        text_surface = font.render(text, True, color)
        text_rect = text_surface.get_rect(center=(WIDTH // 2, y))
        surface.blit(text_surface, text_rect)
    
    @staticmethod
    def draw_text(surface, text, font, color, x, y):
        text_surface = font.render(text, True, color)
        surface.blit(text_surface, (x, y))

class ParticleEffect:
    def __init__(self, x, y, color, effect_type='explosion'):
        self.particles = []
        self.effect_type = effect_type
        
        if effect_type == 'explosion':
            for _ in range(15):
                angle = random.uniform(0, 2 * math.pi)
                speed = random.uniform(2, 6)
                self.particles.append({
                    'x': x, 'y': y,
                    'vx': math.cos(angle) * speed,
                    'vy': math.sin(angle) * speed,
                    'life': 30, 'color': color
                })
    
    def update(self):
        for particle in self.particles[:]:
            particle['x'] += particle['vx']
            particle['y'] += particle['vy']
            particle['life'] -= 1
            
            if particle['life'] <= 0:
                self.particles.remove(particle)
    
    def draw(self, surface):
        for particle in self.particles:
            alpha = particle['life'] / 30.0
            size = int(5 * alpha)
            if size > 0:
                pygame.draw.circle(surface, particle['color'], 
                                 (int(particle['x']), int(particle['y'])), size)
    
    def is_finished(self):
        return len(self.particles) == 0

def main():
    clock = pygame.time.Clock()
    game = Game()
    renderer = Renderer()
    running = True
    
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    if game.state != MENU:
                        game.state = MENU
                        game.reset_all_quests()
        
        keys = pygame.key.get_pressed()
        
        # Clear screen
        screen.fill(WHITE)
        
        if game.state == MENU:
            handle_menu(screen, game, keys, renderer)
        elif game.state == INSTRUCTIONS:
            handle_instructions(screen, game, keys, renderer)
        elif game.state == QUEST1:
            handle_quest1(screen, game, keys, renderer)
        elif game.state == QUEST2:
            handle_quest2(screen, game, keys, renderer)
        elif game.state == QUEST3:
            handle_quest3(screen, game, keys, renderer)
        elif game.state == WIN:
            handle_win_screen(screen, game, keys, renderer)
        
        # Update particles
        for particle_effect in game.particles[:]:
            particle_effect.update()
            particle_effect.draw(screen)
            if particle_effect.is_finished():
                game.particles.remove(particle_effect)
        
        pygame.display.flip()
        clock.tick(60)
    
    pygame.quit()
    sys.exit()

def handle_menu(surface, game, keys, renderer):
    # Draw beautiful gradient background
    renderer.draw_gradient_background(surface, LIGHT_BLUE, WHITE)
    
    # Title
    renderer.draw_text_centered(surface, "ENVIRONMENTAL HEROES", font_title, DARK_GREEN, 150)
    renderer.draw_text_centered(surface, "Save the Planet - One Quest at a Time", font_medium, GREEN, 200)
    
    # Menu options
    renderer.draw_text_centered(surface, "Press 1: Solve Water Shortage Crisis", font_large, DEEP_BLUE, 300)
    renderer.draw_text_centered(surface, "Press 2: Reduce Plastic Waste Pollution", font_large, RED, 350)
    renderer.draw_text_centered(surface, "Press 3: Convert Industries to Green Energy", font_large, PURPLE, 400)
    renderer.draw_text_centered(surface, "Press I: Instructions", font_medium, BLACK, 480)
    renderer.draw_text_centered(surface, "Press ESC: Quit", font_small, GRAY, 520)
    
    # Handle input
    if keys[pygame.K_1]:
        game.state = QUEST1
        game.reset_all_quests()
        pygame.time.wait(200)
    elif keys[pygame.K_2]:
        game.state = QUEST2
        game.reset_all_quests()
        pygame.time.wait(200)
    elif keys[pygame.K_3]:
        game.state = QUEST3
        game.reset_all_quests()
        pygame.time.wait(200)
    elif keys[pygame.K_i]:
        game.state = INSTRUCTIONS
        pygame.time.wait(200)

def handle_instructions(surface, game, keys, renderer):
    renderer.draw_gradient_background(surface, WHITE, LIGHT_BLUE)
    
    renderer.draw_text_centered(surface, "INSTRUCTIONS", font_title, DARK_GREEN, 80)
    
    instructions = [
        "Quest 1 - Water Shortage: Use arrow keys to move and catch falling water drops",
        "Quest 2 - Plastic Waste: Collect plastic waste items before they hit the ground",
        "Quest 3 - Green Energy: Move near factories and hold SPACE to convert them",
        "",
        "Use LEFT/RIGHT arrow keys to move your eco-hero",
        "Complete the target for each quest to save the environment!",
        "",
        "Press ESC to return to menu"
    ]
    
    y_offset = 180
    for instruction in instructions:
        if instruction:
            renderer.draw_text_centered(surface, instruction, font_medium, BLACK, y_offset)
        y_offset += 40

def handle_quest1(surface, game, keys, renderer):
    # Water-themed background
    renderer.draw_gradient_background(surface, LIGHT_BLUE, WHITE)
    
    # Player movement
    if keys[pygame.K_LEFT] and game.player_pos[0] > 0:
        game.player_pos[0] -= game.player_speed
    if keys[pygame.K_RIGHT] and game.player_pos[0] < WIDTH - game.player_size:
        game.player_pos[0] += game.player_speed
    
    # Update water drops
    for i, drop in enumerate(game.water_drops):
        drop[1] += game.water_drop_speed
        
        # Reset if off screen
        if drop[1] > HEIGHT:
            drop[0] = random.randint(50, WIDTH - 50)
            drop[1] = random.randint(-200, -50)
        
        # Check collision with player
        player_rect = pygame.Rect(game.player_pos[0], game.player_pos[1], 
                                 game.player_size, game.player_size)
        drop_rect = pygame.Rect(drop[0] - game.water_drop_size//2, 
                               drop[1] - game.water_drop_size//2,
                               game.water_drop_size, game.water_drop_size)
        
        if player_rect.colliderect(drop_rect):
            game.water_caught += 1
            game.particles.append(ParticleEffect(drop[0], drop[1], LIGHT_BLUE))
            drop[0] = random.randint(50, WIDTH - 50)
            drop[1] = random.randint(-200, -50)
    
    # Draw everything
    renderer.draw_text(surface, "QUEST: Solve Water Shortage Crisis", font_large, DEEP_BLUE, 20, 20)
    renderer.draw_text(surface, f"Water Collected: {game.water_caught}/{game.water_target}", 
                      font_medium, DEEP_BLUE, 20, 60)
    
    # Progress bar
    progress = min(game.water_caught / game.water_target, 1.0)
    pygame.draw.rect(surface, GRAY, (20, 90, 300, 20))
    pygame.draw.rect(surface, LIGHT_BLUE, (20, 90, 300 * progress, 20))
    
    renderer.draw_player(surface, game.player_pos, game.player_size)
    
    for drop in game.water_drops:
        renderer.draw_water_drop(surface, drop, game.water_drop_size)
    
    if game.water_caught >= game.water_target:
        game.state = WIN
        game.selected_quest = "Water Shortage Crisis"

def handle_quest2(surface, game, keys, renderer):
    # Pollution-themed background
    renderer.draw_gradient_background(surface, (255, 240, 240), WHITE)
    
    # Player movement
    if keys[pygame.K_LEFT] and game.player_pos[0] > 0:
        game.player_pos[0] -= game.player_speed
    if keys[pygame.K_RIGHT] and game.player_pos[0] < WIDTH - game.player_size:
        game.player_pos[0] += game.player_speed
    
    # Update plastic items
    for i, plastic in enumerate(game.plastic_items):
        plastic[1] += game.plastic_speed
        
        # Reset if off screen
        if plastic[1] > HEIGHT:
            plastic[0] = random.randint(50, WIDTH - 50)
            plastic[1] = random.randint(-300, -50)
        
        # Check collision with player
        player_rect = pygame.Rect(game.player_pos[0], game.player_pos[1], 
                                 game.player_size, game.player_size)
        plastic_rect = pygame.Rect(plastic[0], plastic[1], 
                                  game.plastic_size, game.plastic_size)
        
        if player_rect.colliderect(plastic_rect):
            game.plastic_collected += 1
            game.particles.append(ParticleEffect(plastic[0], plastic[1], GREEN))
            plastic[0] = random.randint(50, WIDTH - 50)
            plastic[1] = random.randint(-300, -50)
    
    # Draw everything
    renderer.draw_text(surface, "QUEST: Reduce Plastic Waste Pollution", font_large, RED, 20, 20)
    renderer.draw_text(surface, f"Plastic Collected: {game.plastic_collected}/{game.plastic_target}", 
                      font_medium, RED, 20, 60)
    
    # Progress bar
    progress = min(game.plastic_collected / game.plastic_target, 1.0)
    pygame.draw.rect(surface, GRAY, (20, 90, 300, 20))
    pygame.draw.rect(surface, GREEN, (20, 90, 300 * progress, 20))
    
    renderer.draw_player(surface, game.player_pos, game.player_size)
    
    for plastic in game.plastic_items:
        renderer.draw_plastic_item(surface, plastic, game.plastic_size)
    
    if game.plastic_collected >= game.plastic_target:
        game.state = WIN
        game.selected_quest = "Plastic Waste Pollution"

def handle_quest3(surface, game, keys, renderer):
    # Industrial background
    renderer.draw_gradient_background(surface, (240, 240, 240), WHITE)
    
    # Player movement
    if keys[pygame.K_LEFT] and game.player_pos[0] > 0:
        game.player_pos[0] -= game.player_speed
    if keys[pygame.K_RIGHT] and game.player_pos[0] < WIDTH - game.player_size:
        game.player_pos[0] += game.player_speed
    if keys[pygame.K_UP] and game.player_pos[1] > 0:
        game.player_pos[1] -= game.player_speed
    if keys[pygame.K_DOWN] and game.player_pos[1] < HEIGHT - game.player_size:
        game.player_pos[1] += game.player_speed
    
    # Factory conversion
    if keys[pygame.K_SPACE]:
        player_center = (game.player_pos[0] + game.player_size//2, 
                        game.player_pos[1] + game.player_size//2)
        
        for factory in game.factories:
            if not factory[2]:  # Not converted yet
                factory_center = (factory[0] + game.factory_size//2, 
                                factory[1] + game.factory_size//2)
                distance = math.sqrt((player_center[0] - factory_center[0])**2 + 
                                   (player_center[1] - factory_center[1])**2)
                
                if distance < game.conversion_radius:
                    factory[3] += 2  # Increase conversion progress
                    if factory[3] >= 100:
                        factory[2] = True  # Mark as converted
                        game.factories_converted += 1
                        game.particles.append(ParticleEffect(factory_center[0], 
                                                           factory_center[1], GREEN))
    
    # Draw everything
    renderer.draw_text(surface, "QUEST: Convert Industries to Green Energy", font_large, PURPLE, 20, 20)
    renderer.draw_text(surface, f"Factories Converted: {game.factories_converted}/{game.factories_target}", 
                      font_medium, PURPLE, 20, 60)
    renderer.draw_text(surface, "Hold SPACE near factories to convert them!", 
                      font_small, BLACK, 20, 90)
    
    # Progress bar
    progress = min(game.factories_converted / game.factories_target, 1.0)
    pygame.draw.rect(surface, GRAY, (20, 120, 300, 20))
    pygame.draw.rect(surface, GREEN, (20, 120, 300 * progress, 20))
    
    renderer.draw_player(surface, game.player_pos, game.player_size)
    
    for factory in game.factories:
        renderer.draw_factory(surface, factory[:2], game.factory_size, 
                            factory[2], factory[3])
    
    if game.factories_converted >= game.factories_target:
        game.state = WIN
        game.selected_quest = "Industrial Green Energy Conversion"

def handle_win_screen(surface, game, keys, renderer):
    renderer.draw_gradient_background(surface, GREEN, LIGHT_BLUE)
    
    renderer.draw_text_centered(surface, "🎉 QUEST COMPLETED! 🎉", font_title, WHITE, 200)
    renderer.draw_text_centered(surface, f"You successfully completed:", font_large, WHITE, 280)
    renderer.draw_text_centered(surface, f"{game.selected_quest}!", font_large, YELLOW, 320)
    renderer.draw_text_centered(surface, "You're a true Environmental Hero!", font_medium, WHITE, 380)
    renderer.draw_text_centered(surface, "Press ESC to return to menu and try another quest", 
                              font_medium, WHITE, 450)

if __name__ == "__main__":
    main()

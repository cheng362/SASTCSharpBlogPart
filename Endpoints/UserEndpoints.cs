using Microsoft.EntityFrameworkCore;
using SASTCsharpBlogPart.Data;
using SASTCsharpBlogPart.Models;

namespace SASTCsharpBlogPart.Endpoints;

public static class UserEndpoints
{
	public static void MapUserEndpoints(this IEndpointRouteBuilder routes)
	{
		var group = routes.MapGroup("/api/users").WithTags("Users");

		// 1. 用户注册
		group.MapPost("/register", async (RegisterRequest req, BlogItemContext db) =>
		{
			if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password) || string.IsNullOrWhiteSpace(req.Email))
			{
				return Results.BadRequest(new { message = "用户名、邮箱和密码不能为空" });
			}

			var exists = await db.Users.AnyAsync(u => u.Email == req.Email || u.Username == req.Username);
			if (exists)
			{
				return Results.Conflict(new { message = "用户名或邮箱已被注册" });
			}

			var user = new User
			{
				Username = req.Username,
				Email = req.Email,
				Password = BCrypt.Net.BCrypt.HashPassword(req.Password),
				AvatarUrl = $"https://api.dicebear.com/7.x/identicon/svg?seed={req.Username}",
				CreatedAt = DateTime.UtcNow
			};

			db.Users.Add(user);
			await db.SaveChangesAsync();

			return Results.Created($"/api/users/{user.Id}", new { user.Id, user.Username, user.Email, user.AvatarUrl });
		});

		// 2. 用户登录
		group.MapPost("/login", async (LoginRequest req, BlogItemContext db) =>
		{
			var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
			if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.Password))
			{
				return Results.Unauthorized();
			}

			return Results.Ok(new
			{
				message = "登录成功",
				user = new { user.Id, user.Username, user.Email, user.AvatarUrl, user.Role }
			});
		});
	}
}

public record RegisterRequest(string Username, string Email, string Password);
public record LoginRequest(string Email, string Password);

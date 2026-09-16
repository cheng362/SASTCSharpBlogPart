using Microsoft.EntityFrameworkCore;
using SASTCsharpBlogPart.Data;
using SASTCsharpBlogPart.Models;

namespace SASTCsharpBlogPart.Endpoints;

public static class CommentEndpoints
{
	public static void MapCommentEndpoints(this IEndpointRouteBuilder routes)
	{
		var group = routes.MapGroup("/api/comments").WithTags("Comments");

		// 1. 获取指定博客的所有评论
		group.MapGet("/blog/{blogId:int}", async (int blogId, BlogItemContext db) =>
		{
			var comments = await db.Comment
				.Where(c => c.BlogItmId == blogId && c.ParentId == null) // 对应 BlogItmId
				.Include(c => c.User)
				.Include(c => c.Replies)
					.ThenInclude(r => r.User)
				.OrderByDescending(c => c.CreatedAt)
				.Select(c => new
				{
					c.Id,
					c.Content,
					c.CreatedAt,
					c.BlogItmId,
					User = c.User == null ? null : new
					{
						c.User.Id,
						c.User.Username,
						c.User.AvatarUrl
					},
					Replies = c.Replies.OrderBy(r => r.CreatedAt).Select(r => new
					{
						r.Id,
						r.Content,
						r.CreatedAt,
						r.BlogItmId,
						r.ParentId,
						User = r.User == null ? null : new
						{
							r.User.Id,
							r.User.Username,
							r.User.AvatarUrl
						}
					})
				})
				.ToListAsync();

			return Results.Ok(comments);
		});

		// 2. 发表评论或回复
		group.MapPost("/", async (CreateCommentRequest req, BlogItemContext db) =>
		{
			if (string.IsNullOrWhiteSpace(req.Content))
			{
				return Results.BadRequest(new { message = "评论内容不能为空" });
			}

			var blogExists = await db.BlogItem.AnyAsync(b => b.Id == req.BlogItmId);
			var user = await db.Users.FindAsync(req.UserId);

			if (!blogExists)
			{
				return Results.NotFound(new { message = "指定的博客不存在" });
			}

			if (user == null)
			{
				return Results.NotFound(new { message = "指定的用户不存在" });
			}

			if (req.ParentId.HasValue)
			{
				var parentExists = await db.Comment.AnyAsync(c => c.Id == req.ParentId.Value);
				if (!parentExists)
				{
					return Results.BadRequest(new { message = "父评论不存在" });
				}
			}

			var comment = new Comment
			{
				Content = req.Content.Trim(),
				BlogItmId = req.BlogItmId,
				UserId = req.UserId,
				ParentId = req.ParentId
			};

			db.Comment.Add(comment);
			await db.SaveChangesAsync();

			return Results.Created($"/api/comments/{comment.Id}", new
			{
				comment.Id,
				comment.Content,
				comment.CreatedAt,
				comment.BlogItmId,
				comment.ParentId,
				User = new
				{
					user.Id,
					user.Username,
					user.AvatarUrl
				}
			});
		});
	}
}


public record CreateCommentRequest(string Content, int BlogItmId, int UserId, int? ParentId = null);

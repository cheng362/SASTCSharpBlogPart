using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using SASTCsharpBlogPart.Models;
using SASTCsharpBlogPart.Data;

/// <summary>
/// 提供 BlogItem 相关的 API 端点。
/// </summary>
namespace SASTCsharpBlogPart.Endpoints
{
	/// <summary>
	/// 将 BlogItem 相关的 API 端点映射到路由构建器的扩展方法类。
	/// GET: /api/blogitem - 获取所有博客项
	/// GET: /api/blogitem/{id} - 根据 ID 获取单个博客项
	/// PUT: /api/blogitem/{id} - 更新指定 ID 的博客项
	/// POST: /api/blogitem - 创建新的博客项
	/// DELETE: /api/blogitem/{id} - 删除指定 ID 的博客项
	/// </summary>
	public static class BlogItemEndpoints
	{
		public static void MapBlogItemEndpoints(this IEndpointRouteBuilder routes)
		{
			var group = routes.MapGroup("/api/blogitem").WithTags(nameof(BlogItem));

			group.MapGet("/", async (BlogItemContext db) =>
			{
				return await db.BlogItem.ToListAsync();
			})
			.WithName("GetAllBlogItems");

			group.MapGet("/{id}", async Task<Results<Ok<BlogItem>, NotFound>> (int id, BlogItemContext db) =>
			{
				return await db.BlogItem.AsNoTracking()
					.FirstOrDefaultAsync(model => model.Id == id)
					is BlogItem model
						? TypedResults.Ok(model)
						: TypedResults.NotFound();
			})
			.WithName("GetBlogItemById");

			group.MapPut("/{id}", async Task<Results<Ok, NotFound>> (int id, BlogItem blogitem, BlogItemContext db) =>
			{
				var affected = await db.BlogItem
					.Where(model => model.Id == id)
					.ExecuteUpdateAsync(setters => setters
					.SetProperty(m => m.Id, blogitem.Id)
					.SetProperty(m => m.Title, blogitem.Title)
					.SetProperty(m => m.Author, blogitem.Author)
					.SetProperty(m => m.Description, blogitem.Description)
					.SetProperty(m => m.Content, blogitem.Content)
					.SetProperty(m => m.CreatedAt, blogitem.CreatedAt)
					.SetProperty(m => m.UpdatedAt, blogitem.UpdatedAt)
			);

				return affected == 1 ? TypedResults.Ok() : TypedResults.NotFound();
			})
			.WithName("UpdateBlogItem");

			group.MapPost("/", async (BlogItem blogitem, BlogItemContext db) =>
			{
				db.BlogItem.Add(blogitem);
				await db.SaveChangesAsync();
				return TypedResults.Created($"/api/blogitem/{blogitem.Id}", blogitem);
			})
			.WithName("CreateBlogItem");

			group.MapDelete("/{id}", async Task<Results<Ok, NotFound>> (int id, BlogItemContext db) =>
			{
				var affected = await db.BlogItem
					.Where(model => model.Id == id)
					.ExecuteDeleteAsync();

				return affected == 1 ? TypedResults.Ok() : TypedResults.NotFound();
			})
			.WithName("DeleteBlogItem");
		}
	}
}

using SASTCsharpBlogPart.Data;
using Microsoft.EntityFrameworkCore;
using SASTCsharpBlogPart.Models;

namespace SASTCsharpBlogPart.Data;
/// <summary>
/// 初始化数据库上下文类，用于与博客项数据进行交互。
/// </summary>
/// <param name="options">选项</param>
/// <summary>
///
/// </summary>
/// <typeparam name="BlogItemContext"></typeparam>
public class BlogItemContext(DbContextOptions<BlogItemContext> options) : DbContext(options)
{
	public DbSet<BlogItem> BlogItem { get; set; } = default!;
	public DbSet<Comment> Comment { get; set; } = default!;
	public DbSet<User> Users { get; set; } = default!;

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);

		// 1. 用户邮箱与用户名全局唯一索引
		modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
		modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();

		// 2. 评论与子评论自引用关系及级联删除
		modelBuilder.Entity<Comment>()
			.HasOne(c => c.Parent)
			.WithMany(c => c.Replies)
			.HasForeignKey(c => c.ParentId)
			.OnDelete(DeleteBehavior.Cascade);
	}
	/// <summary>
	/// 异步的保存更改方法，用于在保存博客项时自动设置创建和更新时间戳。
	/// </summary>
	/// <param name="cancellationToken">A cancellation token to monitor for the asynchronous operation.</param>
	/// <returns>一个Task<int>实例，表示异步保存操作。任务结果包含写入数据库的 state entries 数量。</returns>
	/// <summary>
	///
	/// </summary>
	/// <param name="cancellationToken">选项</param>
	/// <returns></returns>


	public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
	{
		foreach (var entry in ChangeTracker.Entries<BlogItem>())
		{
			if (entry.State == EntityState.Added)
			{
				entry.Entity.CreatedAt = DateTime.UtcNow;
				entry.Entity.UpdatedAt = DateTime.UtcNow;
			}

			if (entry.State == EntityState.Modified)
			{
				entry.Entity.UpdatedAt = DateTime.UtcNow;
			}
		}

		foreach (var entry in ChangeTracker.Entries<Comment>())
		{
			if (entry.State == EntityState.Added && entry.Entity.CreatedAt == default)
			{
				entry.Entity.CreatedAt = DateTime.UtcNow;
			}
		}

		return await base.SaveChangesAsync(cancellationToken);
	}
}

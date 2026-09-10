package com.example.aarogyaflow.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.Dao
import androidx.room.Insert

// Placeholder entity for now
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "health_records")
data class HealthRecordEntity(
    @PrimaryKey val id: String,
    val title: String
)

@Dao
interface HealthRecordDao {
    @Insert
    fun insert(record: HealthRecordEntity)
}

@Database(entities = [HealthRecordEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun healthRecordDao(): HealthRecordDao
}

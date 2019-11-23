<template>
	<div class="complaints">
		<div class="container">

			<form @submit.prevent="startSort()">
				<div class="filter">
					<h3>Filter</h3>
					<select v-model="sort.about">
						<option disabled selected value="0">Month</option>
						<option value="all">All</option>
						<option>January</option>
						<option>February</option>
						<option>March</option>
						<option>April</option>
						<option>May</option>
						<option>June</option>
						<option>July</option>
						<option>August</option>
						<option>September</option>
						<option>October</option>
						<option>November</option>
						<option>December</option>
					</select>
					<select v-model="sort.status">
						<option disabled selected value="0">Status</option>
						<option value="all">All</option>
						<option>Solved</option>
						<option>Pending</option>
						<option>Ongoing</option>
						<option>Canceled</option>
					</select>
					<select v-model="sort.way">
						<option disabled selected value="0">Year</option>
						<option value="all">All</option>
						<option>2019</option>
						<option>2020</option>
						<option>2021</option>
						<option>2022</option>
					</select>
					<button type="submit">Go</button>
				</div>
			</form>

			<post v-for="c in complaints" :key="c.id" :data="c" v-if="c.showToPublic"></post>
		</div>
	</div>
</template>

<script>
	import db from '../services/firebase'
	import VueFirestore from 'vue-firestore'
	import Post from '../components/Post'
	
	export default{
		components: {
			Post
		},
		data() {
			return{
				complaints: [],
				sort: {
					way: 0,
					status: 0,
					about: 0,
				}
			}
		},
		methods: {
			startSort() {
				let me = this
				me.$store.state.isLoading = true

				me.complaints = []

				let w = (me.sort.way == 0 || me.sort.way == 'all') ? '0' : '1'
				let t = (me.sort.staus == 0 || me.sort.status == 'all') ? '0' : '1'
				let a = (me.sort.about == 0 || me.sort.about == 'all') ? '0' : '1'

				let combination = '' + w + t + a

				switch(combination) {
					case '000':
						me.$binding('complaints', db.collection('complaints').orderBy('created_at', 'desc'))
						.then(() => me.$store.state.isLoading = false).catch(err => me.complaints = []).then(() => me.$store.state.isLoading = false)
						break
					case '100':
						me.$binding('complaints', db.collection('complaints').where('way', '==', me.sort.way).orderBy('created_at', 'desc'))
						.then(() => me.$store.state.isLoading = false).catch(err => me.complaints = []).then(() => me.$store.state.isLoading = false)
						break
					case '110':
						me.$binding('complaints', db.collection('complaints').where('way', '==', me.sort.way).where('status', '==', me.sort.status).orderBy('created_at', 'desc'))
						.then(() => me.$store.state.isLoading = false).catch(err => me.complaints = []).then(() => me.$store.state.isLoading = false)
						break
					case '111':
						me.$binding('complaints', db.collection('complaints').where('way', '==', me.sort.way).where('status', '==', me.sort.target).where('about', '==', me.sort.about).orderBy('created_at', 'desc'))
						.then(() => me.$store.state.isLoading = false).catch(err => me.complaints = []).then(() => me.$store.state.isLoading = false)
						break
					case '011':
						me.$binding('complaints', db.collection('complaints').where('status', '==', me.sort.status).where('about', '==', me.sort.about).orderBy('created_at', 'desc'))
						.then(() => me.$store.state.isLoading = false).catch(err => me.complaints = []).then(() => me.$store.state.isLoading = false)
						break
					case '001':
						me.$binding('complaints', db.collection('complaints').where('about', '==', me.sort.about).orderBy('created_at', 'desc'))
						.then(() => me.$store.state.isLoading = false).catch(err => me.complaints = []).then(() => me.$store.state.isLoading = false)
						break
					case '010':
						me.$binding('complaints', db.collection('complaints').where('status', '==', me.sort.status).orderBy('created_at', 'desc'))
						.then(() => me.$store.state.isLoading = false).catch(err => me.complaints = []).then(() => me.$store.state.isLoading = false)
						break
					case '111':
						me.$binding('complaints', db.collection('complaints').where('way', '==', me.sort.way).where('about', '==', me.sort.about).orderBy('created_at', 'desc'))
						.then(() => me.$store.state.isLoading = false).catch(err => me.complaints = []).then(() => me.$store.state.isLoading = false)
						break
				}
			}
		},
		mounted() {
			let me = this
			me.$parent.onAdminPanel = false
			me.$store.state.isLoading = true
			me.$binding('complaints', db.collection('complaints').orderBy('created_at', 'desc'))
			.then(() => {
				me.$store.state.isLoading = false
			})
		}
	}
</script>